function optionalChaining(choice: ZamCharacterCustomizationOptionChoiceData) {
    //todo replace by `part.Choices[character[CHARACTER_PART[prop]]]?.Id` when it works on almost all frameworks
    return choice ? choice.Id : undefined
}

export interface CharacterObj {
    face?: number;
    facialStyle?: number;
    gender?: number;
    hairColor?: number;
    hairStyle?: number;
    items?: number[][];
    race?: number;
    skin?: number;
    [key: string]: any;
}

const NOT_DISPLAYED_SLOTS = [
    2, // neck
    11, // finger1
    12, // finger1
    13, // trinket1
    14, // trinket2
]

const CHARACTER_PART: ({[key: string]: string}) = {
    Face: `face`,
    "Skin Color": `skin`,
    "Hair Style": `hairStyle`,
    "Hair Color": `hairColor`,
    "Facial Hair": `facialStyle`,
    Mustache: `facialStyle`,
    Beard: `facialStyle`,
    Sideburns: `facialStyle`,
    "Face Shape": `facialStyle`,
    Eyebrow: `facialStyle`,
    "Jaw Features": undefined,
    "Face Features": undefined,
    "Skin Type": undefined,
    Ears: undefined,
    Horns: undefined,
    Blindfold: undefined,
    Tattoo: undefined,
    "Eye Color": undefined,
    "Tattoo Color": undefined,
    Armbands: undefined,
    "Jewelry Color": undefined,
    Bracelets: undefined,
    Necklace: undefined,
    Earring: undefined
}

function getCharacterOptions(character: CharacterObj, fullOptions: ZamCharacterData) {
    const options = fullOptions.Options
    const ret = []
    for (const prop in CHARACTER_PART) {
        const part = options.find(e => e.Name === prop)

        if (!part) {
            continue
        }

        const newOption = {
            optionId: part.Id,
            choiceId: (CHARACTER_PART[prop])
                ? optionalChaining(part.Choices[character[CHARACTER_PART[prop]]])
                : character[prop] ? part.Choices[character[prop]].Id : part.Choices[0].Id
        }
        ret.push(newOption)
    }

    return ret
}

function optionsFromModel(model: CharacterObj, fullOptions: ZamCharacterData): ZamModelViewerCharacterInitData {
    const { race, gender } = model

    // slot ids on model viewer
    const characterItems = (model.items) ? model.items.filter(e => !NOT_DISPLAYED_SLOTS.includes(e[0])) : []
    const options = getCharacterOptions(model, fullOptions)

    return {
        items: characterItems,
        charCustomization: {
            options: options
        },
        models: {
            id: race * 2 - 1 + gender,
            type: 16
        },
    }
}

async function getDisplaySlot(item: number, slot: number, displayId: number): Promise<{ displaySlot: number, displayId: number}> {
    if (typeof item !== `number`) {
        throw new Error(`item must be a number`)
    }

    if (typeof slot !== `number`) {
        throw new Error(`slot must be a number`)
    }

    if (typeof displayId !== `number`) {
        throw new Error(`displayId must be a number`)
    }

    try {
        await fetch(`${window.CONTENT_PATH}meta/armor/${slot}/${displayId}.json`)
            .then(response => response.json())

        return {
            displaySlot: slot,
            displayId: displayId
        }
    } catch (e) {
        if (!window.WOTLK_TO_RETAIL_DISPLAY_ID_API) {
            throw Error(`Item not found and window.WOTLK_TO_RETAIL_DISPLAY_ID_API not set`)
        }
        const resp = await fetch(`${window.WOTLK_TO_RETAIL_DISPLAY_ID_API}/${item}/${displayId}`)
            .then((response) => response.json())
        const res = resp.data || resp
        if (res.newDisplayId !== displayId) {
            return {
                displaySlot: slot,
                displayId: res.newDisplayId
            }
        }
    }

    // old slots to new slots
    const retSlot = {
        5: 20, // chest
        16: 21, // main hand
        18: 22 // off hand
    }[slot]

    if (!retSlot) {
        console.warn(`Item: ${item} display: ${displayId} or slot: ${slot} not found for `)

        return {
            displaySlot: slot,
            displayId: displayId
        }
    }

    return {
        displaySlot: retSlot,
        displayId: displayId
    }
}

async function findRaceGenderOptions(race: number, gender: number): Promise<ZamCharacterData> {
    const raceGender = race * 2 - 1 + gender
    const options = await fetch(`${window.CONTENT_PATH}meta/charactercustomization/${raceGender}.json`)
        .then(
            (response) => response.json()
        )
    if (options.data) {
        return options.data
    }

    return options
}

export class WowModelViewer extends ZamModelViewer {
    _currentCharacterOptions: ZamCharacterData | null = null;
    _characterGender: number | null = null;
    _characterRace: number | null = null;

    getListAnimations(): Array<string> {
        return [...new Set(this.renderer.models[0].ap.map((e: any) => e.j))] as Array<string>
    }

    setDistance(val: number) {
        this.renderer.distance = val
    }

    setAnimation(val: string) {
        if (!this.getListAnimations().includes(val)) {
            console.warn(`${this.constructor.name}: Animation ${val} not found`)
        }
        this.renderer.models[0].setAnimation(val)
    }

    setAnimPaused(val: boolean) {
        this.renderer.models[0].setAnimPaused(val)
    }

    setAzimuth(val: number) {
        this.renderer.azimuth = val
    }

    setZenith(val: number) {
        this.renderer.zenith = val
    }

    getAzimuth(): number {
        return this.renderer.azimuth
    }

    getZenith(): number {
        return this.renderer.zenith
    }

    /**
     * This methode is based on `updateViewer` from Paperdoll.js (https://wow.zamimg.com/js/Paperdoll.js?3ee7ec5121)
     */
    updateItemViewer(slot: number, displayId: number, enchant: number) {
        const s = window.WH.Wow.Item
        if (slot === s.INVENTORY_TYPE_SHOULDERS) {
            // this.method(`setShouldersOverride`, [this.getShouldersOverrideData()]);
        }
        const a = (slot === s.INVENTORY_TYPE_ROBE) ? s.INVENTORY_TYPE_CHEST : slot

        window.WH.debug(`Clearing model viewer slot:`, a.toString())
        this.method(`clearSlots`, slot.toString())
        if (displayId) {
            window.WH.debug(`Attaching to model viewer slot:`, slot.toString(), `Display ID:`, displayId, `Enchant Visual:`, enchant)
            this.method(`setItems`, [[{
                slot: slot,
                display: displayId,
                visual: enchant || 0
            }]])
        }
    }

    setCustomItem(slot: number, itemData: ZamItemData) {
        const viewer = this;
        $.ajax({
            url: `${window.EXPRESS_URI}/customItem`,
            method: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(itemData),
            success: function (data) {
                viewer.method(`clearSlots`, "1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22,23,27")
                viewer.method(`setItems`, [[{
                    slot: slot,
                    display: data.Id,
                    visual: 0
                }]])
            }
        });
    }

    setNewAppearance(options: CharacterObj) {
        if (!this.currentCharacterOptions) {
            throw Error(`Character options are not set`)
        }
        const characterOptions = getCharacterOptions(options, this.currentCharacterOptions)
        const race = this.characterRace
        const gender = this.characterGender
        this.method(`setAppearance`, { race: race, gender: gender, options: characterOptions })
    }

    get currentCharacterOptions() { return this._currentCharacterOptions; }
    set currentCharacterOptions(value) { this._currentCharacterOptions = value; }
    get characterGender() { return this._characterGender; }
    set characterGender(value) { this._characterGender = value; }
    get characterRace() { return this._characterRace; }
    set characterRace(value) { this._characterRace = value; }
}

async function generateModels(aspect: number, containerSelector: string, model: CharacterObj): Promise<WowModelViewer> {
    let modelOptions: ZamModelViewerCharacterInitData;
    let fullOptions: ZamCharacterData
    if (model.id && model.type) {
        const { id, type } = model
        modelOptions =  { models: { id, type } }
    } else {
        const { race, gender } = model

        // CHARACTER OPTIONS
        // This is how we describe a character properties
        fullOptions = await findRaceGenderOptions(
            race,
            gender
        )
        modelOptions = optionsFromModel(model, fullOptions)
    }
    const models: ZamModelViewerInitData = {
        type: 2,
        contentPath: window.CONTENT_PATH,
        // eslint-disable-next-line no-undef
        container: jQuery(containerSelector),
        aspect: aspect,
        hd: true,
        ...modelOptions
    }
    window.models = models

    // eslint-disable-next-line no-undef
    const wowModelViewer = await new WowModelViewer(models)
    if (fullOptions) {
        wowModelViewer.currentCharacterOptions = fullOptions
        wowModelViewer.characterGender = model.gender
        wowModelViewer.characterRace = model.race

    }
    return wowModelViewer
}

export {
    findRaceGenderOptions
}