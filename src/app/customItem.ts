import { findRaceGenderOptions, WowModelViewer } from "./wow-model-viewer"
import { 
    getGeoSetsForInventoryType, rgbaToInt, getComponentSectionsForInventoryType,
    getRaceName, getClassName, intToByteArray, byteToHexCode, getColorStringFromNumber,
} from "./wow-data-utils"

import { 
    TextureFileData, ModelResourceData, ItemToDisplayIdData, ItemGeoSetData, 
    ItemMaterialContainer, ItemComponentModelContainer, ItemData
} from "../models";
import { debounce } from "../utils"

if (!window.WH) {
    window.WH = {
        WebP: {
            getImageExtension: () => ".webp"
        }
    }
    window.WH.debug = () => {};
    window.WH.defaultAnimation = `Stand`
    window.WH.Wow = {
        ItemFeatureFlags: {
            1: "Emblazoned Tabard",
            2: "No sheathed kit during spell combat anims",
            4: "Hide Pants and Belt",
            8: "Emblazoned Tabard (Rare)",
            16: "Emblazoned Tabard (Epic)",
            32: "Use Spear Ranged Weapon Attachment",
            64: "Inherit character animation",
            128: "Mirror Animation from Right Shoulder to Left",
            256: "Mirror Model When Equipped on Off-Hand",
            512: "Disable Tabard Geo (waist only)",
            1024: "Mirror Model When Equipped on Main -Hand",
            2048: "Mirror Model When Sheathed (Warglaives)",
            4096: "Flip Model When Sheathed",
            8192: "Use Alternate Weapon Trail Endpoint",
            16384: "Force Sheathed if equipped as weapon",
            32768: "Don't close hands",
            65536: "Force Unsheathed for Spell Combat Anims",
            131072: "Brewmaster Unsheathe",
            262144: "Hide Belt Buckle",
            524288: "No Default Bowstring",
            1048576: "Unknown Effect 1",
            2097152: "Unknown Effect 2",
            4194304: "Unknown Effect 3",
            8388608: "Unknown Effect 4",
            16777216: "Unknown Effect 5",
            33554432: "Unknown Effect 6",
            67108864: "Unknown Effect 7",
            134217728: "Unknown Effect 8",
        },
        Item: {
            INVENTORY_TYPE_HEAD: 1,
            INVENTORY_TYPE_NECK: 2,
            INVENTORY_TYPE_SHOULDERS: 3,
            INVENTORY_TYPE_SHIRT: 4,
            INVENTORY_TYPE_CHEST: 5,
            INVENTORY_TYPE_WAIST: 6,
            INVENTORY_TYPE_LEGS: 7,
            INVENTORY_TYPE_FEET: 8,
            INVENTORY_TYPE_WRISTS: 9,
            INVENTORY_TYPE_HANDS: 10,
            INVENTORY_TYPE_FINGER: 11,
            INVENTORY_TYPE_TRINKET: 12,
            INVENTORY_TYPE_ONE_HAND: 13,
            INVENTORY_TYPE_SHIELD: 14,
            INVENTORY_TYPE_RANGED: 15,
            INVENTORY_TYPE_BACK: 16,
            INVENTORY_TYPE_TWO_HAND: 17,
            INVENTORY_TYPE_BAG: 18,
            INVENTORY_TYPE_TABARD: 19,
            INVENTORY_TYPE_ROBE: 20,
            INVENTORY_TYPE_MAIN_HAND: 21,
            INVENTORY_TYPE_OFF_HAND: 22,
            INVENTORY_TYPE_HELD_IN_OFF_HAND: 23,
            INVENTORY_TYPE_PROJECTILE: 24,
            INVENTORY_TYPE_THROWN: 25,
            INVENTORY_TYPE_RANGED_RIGHT: 26,
            INVENTORY_TYPE_QUIVER: 27,
            INVENTORY_TYPE_RELIC: 28,
            INVENTORY_TYPE_PROFESSION_TOOL: 29,
            INVENTORY_TYPE_PROFESSION_ACCESSORY: 30
        },
        ComponentSections: {
            0: "Upper Arm",
            1: "Lower Arm",
            2: "Hand",
            3: "Upper Torso",
            4: "Lower Torso",
            5: "Upper Leg",
            6: "Lower Leg",
            7: "Foot",
            8: "Accesory",
            12: "Cloak"
        },
        GeoSets: {
            0: {
                title: "Head Geoset",
                options: []
            },
            1: {
                title: "Beard / Facial1 Geoset",
                options: []
            },
            2: {
                title: "Sideburns / Facial2 Geoset",
                options: []
            },
            3: {
                title: "Moustache / Facial3 Geoset",
                options: []
            },
            4: {
                title: "Gloves Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    },
                    {
                        name: "Thin",
                        value: 1
                    },
                    {
                        name: "Folded",
                        value: 2
                    },
                    {
                        name: "Thick",
                        value: 3
                    },
                ]
            },
            5: {
                title: "Boots Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    },
                    {
                        name: "High Boot",
                        value: 1
                    },
                    {
                        name: "Folded Boot",
                        value: 2
                    },
                    {
                        name: "Puffed",
                        value: 3
                    },
                    {
                        name: "Boot 4",
                        value: 4
                    },
                ]
            },
            6: {
                title: "Shirt Geoset",
                options: []
            },
            7: {
                title: "Ears Geoset",
                options: []
            },
            8: {
                title: "Sleeves Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Flared Sleeve",
                        value: 1
                    },
                    {
                        name: "Puffy Sleeve",
                        value: 2
                    },
                    {
                        name: "Panda Collar Shirt",
                        value: 3
                    },
                ]
            },
            9: {
                title: "Legcuffs Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Flared",
                        value: 1
                    },
                    {
                        name: "Ruffled",
                        value: 2
                    },
                    {
                        name: "Panda Pants",
                        value: 3
                    },
                ]
            },
            10: {
                title: "Shirt Doublet Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Doublet",
                        value: 1
                    },
                    {
                        name: "Body 2",
                        value: 2
                    },
                    {
                        name: "Body 3",
                        value: 3
                    },
                ]
            },
            11: {
                title: "Pant Doublet Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Mini Skirt",
                        value: 1
                    },
                    {
                        name: "Armored Pants",
                        value: 3
                    }
                ]
            },
            12: {
                title: "Tabard Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Tabard",
                        value: 1
                    }
                ]
            },
            13: {
                title: "Lower Body Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    },
                    {
                        name: "Long Skirt",
                        value: 1
                    },
                ]
            },
            14: {
                title: "DH/Pandaren F Loincloth Geoset",
                options: []
            },
            15: {
                title: "Cloak Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: 0
                    },
                    {
                        name: "Ankle Length",
                        value: 1
                    },
                    {
                        name: "Knee Length",
                        value: 2
                    },
                    {
                        name: "Split Banner",
                        value: 3
                    },
                    {
                        name: "Tapered Waist",
                        value: 4
                    },
                    {
                        name: "Notched Back",
                        value: 5
                    },
                    {
                        name: "Guild Cloak",
                        value: 6
                    },
                    {
                        name: "Split (Long)",
                        value: 7
                    },
                    {
                        name: "Tapered (Long)",
                        value: 8
                    },
                    {
                        name: "Notched (Long)",
                        value: 9
                    },
                ]
            },
            16: {
                title: "Facial Jewelry Geoset",
                options: []
            },
            17: {
                title: "Eye Effects Geoset",
                options: []
            },
            18: {
                title: "Belt Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    },
                    {
                        name: "Heavy Belt",
                        value: 1
                    },
                    {
                        name: "Panda Cord Belt",
                        value: 2
                    }
                ]
            },
            19: {
                title: "Skin (Bone/Tail) Geoset",
                options: []
            },
            20: {
                title: "Feet Geoset",
                options: [
                    {
                        name: "Toes",
                        value: 0
                    },
                    {
                        name: "Basic Shoes",
                        value: 1
                    },
                ]
            },
            21: {
                title: "Head Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Show Head",
                        value: 0
                    }
                ]
            },
            22: {
                title: "Torso Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    },
                    {
                        name: "Covered Torso",
                        value: 1
                    }
                ]
            },
            23: {
                title: "Hand Attachments Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    }
                ]
            },
            24: {
                title: "Head Attachments Geoset",
                options: []
            },
            25: {
                title: "Facewear Geoset",
                options: []
            },
            26: {
                title: "Shoulders Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Show Shoulders",
                        value: 0
                    },
                    {
                        name: "Non-Mythic Only",
                        value: 1
                    },
                    {
                        name: "Mythic",
                        value: 2
                    }
                ]
            },
            27: {
                title: "Helmet Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Helm 1",
                        value: 0
                    },
                    {
                        name: "Non-Mythic only",
                        value: 2
                    },
                    {
                        name: "Mythic",
                        value: 3
                    },
                ]
            },
            28: {
                title: "Arm Upper Geoset",
                options: [
                    {
                        name: "No Geoset",
                        value: -1
                    },
                    {
                        name: "Default",
                        value: 0
                    }
                ]
            },
            29: {
                title: "Arms Replace Geoset",
                options: []
            },
            30: {
                title: "Legs Replace Geoset",
                options: []
            },
            31: {
                title: "Feet Replace Geoset",
                options: []
            },
            32: {
                title: "Head SwapGeoset",
                options: []
            },
            33: {
                title: "Eyes Geoset",
                options: []
            },
            34: {
                title: "Eyebrows Geoset",
                options: []
            },
            35: {
                title: "Piercings/Earrings Geoset",
                options: []
            },
            36: {
                title: "Necklaces Geoset",
                options: []
            },
            37: {
                title: "Headdress Geoset",
                options: []
            },
            38: {
                title: "Tail Geoset",
                options: []
            },
            39: {
                title: "Misc. Accessory Geoset",
                options: []
            },
            40: {
                title: "Misc. Feature Geoset",
                options: []
            },
            41: {
                title: "Noses (Goblins) Geoset",
                options: []
            },
            42: {
                title: "Hair decoration (LF Draenei) Geoset",
                options: []
            },
            43: {
                title: "Horn decoration (HM Tauren) Geoset",
                options: []
            },
        }
    }
}

const character = {
    "race": 11,
    "gender": 1,
    "customizations": [
        ({ optionId: 133, choiceId: 1959 }),
        ({ optionId: 134, choiceId: 1963 }),
        ({ optionId: 135, choiceId: 1983 }),
        ({ optionId: 136, choiceId: 2000 }),
        ({ optionId: 137, choiceId: 2011 }),
        ({ optionId: 619, choiceId: 6978 }),
        ({ optionId: 689, choiceId: 7703 }),
        ({ optionId: 697, choiceId: 7764 }),
        ({ optionId: 699, choiceId: 7791 }),
        ({ optionId: 701, choiceId: 7796 }),
        ({ optionId: 778, choiceId: 8643 })
    ]
};


let itemMaterials: ItemMaterialContainer = {}

let itemComponentModels: ItemComponentModelContainer = {
    "0": {
        texture: {
            id: -1,
            name: ""
        },
        models: []
    },
    "1": {
        texture: {
            id: -1,
            name: ""
        },
        models: []
    }
};
let particleColors: number[][] = [];

let helmetGeoVisMale = [] as ItemGeoSetData[];
let helmetGeoVisFemale = [] as ItemGeoSetData[];
let flags = 0;

function onSearchTexture() {
    window.db.all(`
        SELECT * FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_texture_textureFile").val()
    ).then((resp) => {
        if (resp.error) {
            throw resp.error;
        }
        const data = resp.result as TextureFileData[];
        $("#ci_texture_textureResults").empty();
        for (const texture of data) {
            const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
            itemElem.text(texture.fileName);
            itemElem.on("click", function () {
                $("#ci_texture_textureFile").val(texture.fileName);
                $("#ci_texture_fileId").val(texture.fileId);
                $("#ci_texture_textureResults").empty();
                $("#addTextureBtn").removeAttr('disabled');
            });
            const li = $("<li>");
            li.append(itemElem);
            $("#ci_texture_textureResults").append(li);
        }
    });
}

function onSearchItem() {
    window.db.all(`
        SELECT * FROM item_to_displayid 
        WHERE itemName like '%'|| ?1 || '%'
        OR itemId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_item_search").val()
    ).then((resp) => {
        if (resp.error) {
            throw resp.error;
        }
        const data = resp.result as ItemToDisplayIdData[];
        $("#ci_item_searchResults").empty();
            for (const item of data) {
                const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
                itemElem.text(item.itemName);
                itemElem.on("click", function () {
                    $("#ci_item_search").val(item.itemName);
                    $("#ci_item_displayId").val(item.itemDisplayId);
                    $("#ci_item_inventoryType").val(item.inventoryType);

                    $("#ci_item_searchResults").empty();
                    $("#loadItemBtn").removeAttr('disabled');
                });
                const li = $("<li>");
                li.append(itemElem);
                $("#ci_item_searchResults").append(li);
            }
    })
}

function onSearchComponentModel() {
    window.db.all(`
        SELECT * FROM modelresources 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_componentmodel_modelfile").val()
    ).then((resp) => {
        if (resp.error) {
            throw resp.error;
        }
        const data = resp.result as ModelResourceData[];
        $("#ci_componentmodel_searchResults").empty();
        for (const item of data) {
            const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
            itemElem.text(item.fileName);
            itemElem.on("click", function () {
                $("#ci_componentmodel_modelfile").val(item.fileName);
                $("#ci_componentmodel_fileId").val(item.fileId);

                $("#ci_componentmodel_searchResults").empty();
                $("#addComponentModelBtn").removeAttr('disabled');
            });
            const li = $("<li>");
            li.append(itemElem);
            $("#ci_componentmodel_searchResults").append(li);
        }
    });
}

function onSearchComponentTexture() {
    window.db.all(`
        SELECT * FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_componenttexture_file").val()
    ).then((resp) => {
        if (resp.error) {
            throw resp.error;
        }
        const data = resp.result as TextureFileData[];
        $("#ci_componenttexture_searchResults").empty();
        for (const texture of data) {
            const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
            itemElem.text(texture.fileName);
            itemElem.on("click", function () {
                $("#ci_componenttexture_file").val(texture.fileName);
                $("#ci_componenttexture_fileId").val(texture.fileId);
                $("#ci_componenttexture_searchResults").empty();
                $("#addComponentTextureBtn").removeAttr('disabled');
            });
            const li = $("<li>");
            li.append(itemElem);
            $("#ci_componenttexture_searchResults").append(li);
        }
    });
}

function onInventorySlotChange() {
    itemMaterials = {};
    let inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);
    $("#geosetSection").empty();

    let geoSets = getGeoSetsForInventoryType(inventorySlot);
    for (const set of geoSets) {
        const geoSetData = window.WH.Wow.GeoSets[set];
        const formGroup = $("<div class='form-group mb-3' />");
        formGroup.append($("<label for='ci_geoset_" + set + "' class='form-label'>" + geoSetData.title + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const select = $("<select id='ci_geoset_" + set + "' class='form-select' />");
        for (const opt of geoSetData.options) {
            select.append("<option value='" + opt.value + "'>" + opt.name + "</option>");
        }
        select.on('change', function () {
            previewCustomItem();
        })
        inputGroup.append(select);
        formGroup.append(inputGroup);
        $("#geosetSection").append(formGroup);
    }

    const randomizeButton = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
    randomizeButton.on("click", onRandomizeGeosetData);
    $("#geosetSection").append(randomizeButton);


    if (inventorySlot === window.WH.Wow.Item.INVENTORY_TYPE_HEAD) {
        $("#geoSetOverrideSection1").parent().show();
        $("#geoSetOverrideSection2").parent().show();
    } else {
        $("#geoSetOverrideSection1").parent().hide();
        $("#geoSetOverrideSection2").parent().hide();
    }

    reloadTexturesComponents();
    if (window.model) {
        previewCustomItem();
    }
}

function onAddTexture() {
    const section = parseInt($("#ci_texture_componentsection").val().toString(), 10);
    const textureData = {
        fileName: $("#ci_texture_textureFile").val().toString(),
        fileId: parseInt($("#ci_texture_fileId").val().toString(), 10),
        gender: 3,
        race: 0,
        class: 0,
    };
    if (itemMaterials[section]) {
        itemMaterials[section].push(textureData);
    } else {
        itemMaterials[section] = [textureData];
    }
    reloadTexturesComponents();
    previewCustomItem();
}

function onAddComponentModel() {
    const componentId = $("#ci_component_id").val().toString();
    const modelData = {
        fileName: $("#ci_componentmodel_modelfile").val().toString(),
        fileId: parseInt($("#ci_componentmodel_fileId").val().toString(), 10),
        gender: 3,
        race: 0,
        class: 0,
        extraData: parseInt($("#ci_componentmodel_extraData").val().toString(), 10)
    };
    itemComponentModels[componentId].models.push(modelData);
    reloadComponentModelsComponents();
    previewCustomItem();
}

function onAddComponentTexture() {
    const componentId = $("#ci_component_id").val().toString();
    const textureData = {
        name: $("#ci_componenttexture_file").val().toString(),
        id: parseInt($("#ci_componenttexture_fileId").val().toString(), 10)
    };
    itemComponentModels[componentId].texture = textureData;
    reloadComponentModelsComponents();
    previewCustomItem();
}

function onAddGeoSetOverride() {
    const overridedata = {
        group: parseInt($("#ci_helmetgeovis_geosetgroup").val().toString(), 10),
        race: parseInt($("#ci_helmetgeovis_race").val().toString(), 10),
    }
    if ($("#ci_helmetgeovis_gender").val() === "0") {
        helmetGeoVisMale.push(overridedata);
    } else {
        helmetGeoVisFemale.push(overridedata);
    }
    reloadHelmetGeovisComponents();
    previewCustomItem();
}

function onSetParticleColors() {
    particleColors = [];
    for (let i = 1; i < 4; i++) {
        const colors = [];
        for (let j = 1; j < 4; j++) {
            let colorVal = $("#ci_particle_color" + i + "_" + j).val().toString();
            let a = Math.floor(parseFloat($("#ci_particle_alpha" + i + "_" + j).val().toString()) * 255);
            let r = parseInt(colorVal.substr(1, 2), 16);
            let g = parseInt(colorVal.substr(3, 2), 16);
            let b = parseInt(colorVal.substr(5, 2), 16);
            colors.push(rgbaToInt(r, g, b, a));
        }
        particleColors.push(colors);
    }
    reloadParticleColorComponents();
    previewCustomItem();
}

function onModelRaceChange() {
    character.race = parseInt($("#ci_model_race").val().toString(), 10);
    character.customizations = [];
    reloadCharacterModel();
}

function onModelGenderChange() {
    character.gender = parseInt($("#ci_model_gender").val().toString(), 10);
    character.customizations = [];
    reloadCharacterModel();
}

function onRandomizeItem() {
    onRandomizeGeosetData();
    $.LoadingOverlay("show");
    let promises: Promise<void>[] = [];
    const texturePromises = randomizeTextures();
    promises = promises.concat(texturePromises);
    promises = promises.concat(randomizeComponentModel("0"));
    promises = promises.concat(randomizeComponentModel("1"));
    promises = promises.concat(randomizeComponentTexture("0"));
    promises = promises.concat(randomizeComponentTexture("1"));
    Promise.all(promises).then(function () {
        reloadTexturesComponents();
        reloadComponentModelsComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function onRandomizeGeosetData() {
    let inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);
    let geoSets = getGeoSetsForInventoryType(inventorySlot);
    for (const set of geoSets) {
        const geoSetData = window.WH.Wow.GeoSets[set];
        const option = geoSetData.options[Math.floor(Math.random() * geoSetData.options.length)];
        $("#ci_geoset_" + set).val(option.value);
    }
    previewCustomItem();
}

function onRandomizeTextures() {
    $.LoadingOverlay("show");
    Promise.all(randomizeTextures()).then(function () {
        reloadTexturesComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function onRandomizeComponent1Model() {
    $.LoadingOverlay("show");
    Promise.all(randomizeComponentModel("0")).then(function () {
        reloadComponentModelsComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function onRandomizeComponent1Texture() {
    $.LoadingOverlay("show");
    Promise.all(randomizeComponentTexture("0")).then(function () {
        reloadComponentModelsComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function onRandomizeComponent2Model() {
    $.LoadingOverlay("show");
    Promise.all(randomizeComponentModel("1")).then(function () {
        reloadComponentModelsComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function onRandomizeComponent2Texture() {
    $.LoadingOverlay("show");
    Promise.all(randomizeComponentTexture("1")).then(function () {
        reloadComponentModelsComponents();
        previewCustomItem();
        $.LoadingOverlay("hide");
    })
}

function randomizeTextures(): Promise<void>[] {
    const inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);
    const sections = getComponentSectionsForInventoryType(inventorySlot);
    const promises = [];
    for (const section of sections) {
        promises.push(window.db.get(`
            SELECT r1.fileId, r1.fileName
            FROM texturefiles AS r1 
            JOIN (SELECT CEIL(?1 * (SELECT MAX(fileId) FROM texturefiles)) AS fileId) AS r2
            WHERE r1.fileId >= r2.fileId
            ORDER BY r1.fileId ASC
            LIMIT 1`, 
            Math.random()
        ).then((resp) => {
            if (resp.error) {
                throw resp.error;
            }
            const data = resp.result as TextureFileData;
            itemMaterials[section] = [{
                fileName: data.fileName,
                fileId: data.fileId,
                gender: 3,
                race: 0,
                class: 0
            }]
        }));
    }
    return promises;
}

function randomizeComponentModel(slot: string) {
    const inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);
    const promises = [];
    let loops = 1;
    if (inventorySlot === window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS) {
        loops = 2;
    }
    for (let i = 0; i < loops; i++) {
        promises.push(window.db.get(`
            SELECT r1.fileId, r1.fileName
            FROM modelresources AS r1 
            JOIN (SELECT CEIL(?1 * (SELECT MAX(fileId) FROM modelresources)) AS fileId) AS r2
            WHERE r1.fileId >= r2.fileId
            ORDER BY r1.fileId ASC
            LIMIT 1`, 
            Math.random()
        ).then((resp) => {
            if (resp.error) {
                throw resp.error;
            }
            const data = resp.result as ModelResourceData;
            itemComponentModels[slot].models = [{
                fileName: data.fileName,
                fileId: data.fileId,
                gender: 3,
                race: 0,
                class: 0,
                extraData: inventorySlot === window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS ? i : -1
            }]
        }));
    }
    return promises;
}

function randomizeComponentTexture(slot: string) {
    const promise = window.db.get(`
        SELECT r1.fileId, r1.fileName
        FROM texturefiles AS r1 
        JOIN (SELECT CEIL(?1 * (SELECT MAX(fileId) FROM texturefiles)) AS fileId) AS r2
        WHERE r1.fileId >= r2.fileId
        ORDER BY r1.fileId ASC
        LIMIT 1`, 
        Math.random()
    ).then((resp) => {
        if (resp.error) {
            throw resp.error;
        }
        const data = resp.result as TextureFileData;
        itemComponentModels[slot].texture = {
            name: data.fileName,
            id: data.fileId
        }
    });
    return [promise];
}

function reloadTexturesComponents() {
    $("#ci_texture_componentsection").empty();

    let inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);

    let opts = getComponentSectionsForInventoryType(inventorySlot);
    // opts = opts.filter((x) => textures.findIndex((y) => y.section === x) === -1);
    for (const opt of opts) {
        $("#ci_texture_componentsection").append($("<option value='" + opt + "'>" + window.WH.Wow.ComponentSections[opt] + "</option>"))
    }

    $("#ci_texture_textureFile").val("");
    $("#ci_texture_fileId").val("")
    $("#ci_texture_gender").val("3");
    $("#ci_texture_race").val("0");
    $("#ci_texture_class").val("0");
    $("#addTextureBtn").attr('disabled', 'true');

    $("#texturesSection .accordion-body").empty();

    for (const sectionStr in itemMaterials) {
        const textures = itemMaterials[sectionStr];
        const section = parseInt(sectionStr, 10);
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            const formGroup = $("<div class='form-group mb-3' />");
            let label = window.WH.Wow.ComponentSections[section];
            if (texture.gender !== 3) {
                label += " - " + (texture.gender === 0 ? "Male" : "Female")
            }
            if (texture.race !== 0) {
                label += " - " + getRaceName(texture.race);
            }
            if (texture.class !== 0) {
                label += " - " + getClassName(texture.class);
            }
            formGroup.append($("<label for='ci_texture_" + section + "_" + i + "' class='form-label'>" + label + "</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_texture_" + section + "_" + i + "' class='form-control' readonly type='text' />");
            input.val(texture.fileName);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", function () {
                itemMaterials[section].splice(itemMaterials[section].indexOf(texture), 1);
                reloadTexturesComponents();
                previewCustomItem();
            });
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);
            $("#texturesSection .accordion-body").append(formGroup);
        }
    }

    if (opts.length > 0) {
        $("#texturesSection .accordion-body")
            .append($("<button type='button' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addTextureModal'>Add Textures</button>"));
        const randomizeButton = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>")
        randomizeButton.on("click", onRandomizeTextures);
        $("#texturesSection .accordion-body")
            .append(randomizeButton);

    } else {
        $("#texturesSection .accordion-body")
            .append($("<p class='text-muted'>Textured geosets are unavailable for this inventory type. Please use components instead.</p>"));
    }

}

function reloadParticleColorComponents() {
    $("#particleColorSection .accordion-body").empty();

    if (particleColors.length > 0) {
        // Set modal colors
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                const [b, g, r, a] = intToByteArray(particleColors[i - 1][j - 1]);
                const hexStr = "#" + byteToHexCode(r) + byteToHexCode(g) + byteToHexCode(b);
                $("#ci_particle_color" + i + "_" + j).val(hexStr);
                $("#ci_particle_alpha" + i + "_" + j).val((a / 255).toFixed(2));
            }
        }

        const table = $("<table class='table'>");
        table.append("<thead><tr><th>#<th>Start</th><th>Mid</th><th>End</th></tr></thead>")
        const tbody = $("<tbody>");
        for (let i = 0; i < particleColors.length; i++) {
            const colorData = particleColors[i];
            const row = $("<tr>");
            row.append($("<td>" + (i + 1) + "</td>"));
            for (const color of colorData) {
                row.append($("<td><div class='me-2' style='width:50px; height:50px; display: inline-block;background-color: " + getColorStringFromNumber(color) + "'></div></td>"))
            }
            tbody.append(row);
        }
        table.append(tbody);
        $("#particleColorSection .accordion-body").append(table);
        const removeButton = $("<button class='btn btn-outline-danger'>Clear Particle Color Override</button>");
        removeButton.on("click", function () {
            particleColors = [];
            reloadParticleColorComponents();
            previewCustomItem();
        })

        const buttons = $("<div class='d-flex justify-content-between'>");
        buttons.append($("<button class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#setParticleOverrideModal'>Edit Particle Colors</button>"));
        buttons.append(removeButton);
        $("#particleColorSection .accordion-body").append(buttons)

    } else {
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 4; j++) {
                $("#ci_particle_color" + i + "_" + j).val("#000000");
                $("#ci_particle_alpha" + i + "_" + j).val("1");
            }
        }
        $("#particleColorSection .accordion-body")
            .append($("<button class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#setParticleOverrideModal'>Set Particle Colors</button>"));
    }
}

function reloadComponentModelsComponents() {
    let inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);

    $("#ci_componenttexture_file").val("");
    $("#ci_componenttexture_fileId").val("")
    $("#ci_componentmodel_modelfile").val("");
    $("#ci_componentmodel_fileId").val("")
    $("#ci_componentmodel_gender").val("3");
    $("#ci_componentmodel_race").val("0");
    $("#ci_componentmodel_class").val("0");
    $("#ci_componentmodel_extradata").val("-1");
    $("#addComponentModelBtn").attr('disabled', 'true');
    $("#addComponentTextureBtn").attr('disabled', 'true');

    $("#component1ModelsSection .accordion-body").empty();
    $("#component2ModelsSection .accordion-body").empty();
    $("#component1TexturesSection .accordion-body").empty();
    $("#component2TexturesSection .accordion-body").empty();

    for (const idStr in itemComponentModels) {
        const data = itemComponentModels[idStr];
        const id = +idStr + 1;

        // Set Texture Content for Component
        if (data.texture.id > 0) {
            const formGroup = $("<div class='form-group mb-3' />");
            formGroup.append($("<label for='ci_componentModelTexture_" + id + "' class='form-label'>Texture File</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_componentModelTexture_" + id + "' class='form-control' readonly type='text' />");
            input.val(data.texture.name);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", function () {
                itemComponentModels[idStr].texture = {
                    id: -1,
                    name: ""
                };
                reloadComponentModelsComponents();
                previewCustomItem();
            });
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);
            $("#component" + id + "TexturesSection .accordion-body").append(formGroup)
        } else {
            const button = $("<button id='component" + id + "AddTextureBtn' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addComponentTextureModal'>Add Texture</button>")
            button.on("click", function () {
                $("#ci_component_id").val(idStr);
            })
            $("#component" + id + "TexturesSection .accordion-body").append(button)
        }
        const randomizeButton1 = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
        randomizeButton1.on("click", idStr === "0" ? onRandomizeComponent1Texture : onRandomizeComponent2Texture);
        $("#component" + id + "TexturesSection .accordion-body").append(randomizeButton1);

        // Set Model Files Content for component

        for (let i = 0; i < data.models.length; i++) {
            const model = data.models[i];
            const formGroup = $("<div class='form-group mb-3' />");
            let label = "Male & Female"
            if (model.gender !== 3) {
                label = (model.gender === 0 ? "Male" : "Female")
            }
            if (model.extraData !== -1) {
                label += " - " + (model.extraData === 0 ? "Left Shoulderpad" : "Right Shoulderpad")
            }
            if (model.race !== 0) {
                label += " - " + getRaceName(model.race);
            }
            if (model.class !== 0) {
                label += " - " + getClassName(model.class);
            }
            formGroup.append($("<label for='ci_componentModel" + id + "_" + i + "' class='form-label'>" + label + "</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_componentModel" + id + "_" + i + "' class='form-control' readonly type='text' />");
            input.val(model.fileName);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", function () {
                itemComponentModels[idStr].models.splice(i, 1);
                reloadComponentModelsComponents();
                previewCustomItem();
            });
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);

            $("#component" + id + "ModelsSection .accordion-body").append(formGroup);
        }

        const button = $("<button type='button' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addComponentModelModal'>Add Model</button>");
        button.on("click", function () {
            $("#ci_component_id").val(idStr);
        });
        $("#component" + id + "ModelsSection .accordion-body").append(button)
        const randomizeButton2 = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
        randomizeButton2.on("click", idStr === "0" ? onRandomizeComponent1Model : onRandomizeComponent2Model);
        $("#component" + id + "ModelsSection .accordion-body").append(randomizeButton2);
    }
}

function reloadFlagsComponents() {
    $("#flagsSection .accordion-body").empty();
    for (const flag in window.WH.Wow.ItemFeatureFlags) {
        const flagId = parseInt(flag, 10);
        const elem = $("<div class='form-check'>");
        const checkbox = $("<input class='form-check-input' type='checkbox' id='cb_flag_" + flag + "' />");
        if ((flags & flagId) > 0) {
            checkbox.attr('checked', 'true');
        }
        checkbox.on('click', function () {
            if ((flags & flagId) > 0) {
                flags -= flagId;
            } else {
                flags += flagId;
            }
            previewCustomItem();
        })
        elem.append(checkbox);
        elem.append("<label class='form-check-label' for='id='cb_flag_" + flag + "'>" + window.WH.Wow.ItemFeatureFlags[flag] + "</label>");
        $("#flagsSection .accordion-body").append(elem);
    }
}

function reloadHelmetGeovisComponents() {
    $("#ci_helmetgeovis_geosetgroup").empty();

    for (const geosetId in window.WH.Wow.GeoSets) {
        $("#ci_helmetgeovis_geosetgroup").append($("<option value='" + geosetId + "'>" + window.WH.Wow.GeoSets[geosetId].title + "</option>"))
    }

    $("#ci_helmetgeovis_geosetgroup").val("0");
    $("#ci_helmetgeovis_race").val("1");
    $("#ci_helmetgeovis_gender").val("");

    $("#geoSetOverrideSection1 .accordion-body").empty();
    $("#geoSetOverrideSection2 .accordion-body").empty();

    for (let i = 0; i < helmetGeoVisMale.length; i++) {
        const gsOverride = helmetGeoVisMale[i];
        const formGroup = $("<div class='form-group mb-3' />");
        let label = window.WH.Wow.GeoSets[gsOverride.group].title;
        label += " - " + getRaceName(gsOverride.race);
        formGroup.append($("<label for='ci_gsOverride_m_" + i + "' class='form-label'>" + label + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const input = $("<input id='ci_gsOverride_m_" + i + "' class='form-control' readonly type='text' />");
        input.val("Disabled");
        inputGroup.append(input);
        const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
        removeButton.on("click", function () {
            helmetGeoVisMale.splice(i, 1);
            reloadHelmetGeovisComponents();
            previewCustomItem();
        });
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $("#geoSetOverrideSection1 .accordion-body").append(formGroup);
    }
    const buttonM = $("<button id='addGsOverrideM' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Geoset Override</button>");
    buttonM.on("click", function () {
        $("#ci_helmetgeovis_gender").val("0");
    })
    $("#geoSetOverrideSection1 .accordion-body").append(buttonM);

    for (let i = 0; i < helmetGeoVisFemale.length; i++) {
        const gsOverride = helmetGeoVisFemale[i];
        const formGroup = $("<div class='form-group mb-3' />");
        let label = window.WH.Wow.GeoSets[gsOverride.group].title;
        label += " - " + getRaceName(gsOverride.race);
        formGroup.append($("<label for='ci_gsOverride_m_" + i + "' class='form-label'>" + label + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const input = $("<input id='ci_gsOverride_m_" + i + "' class='form-control' readonly type='text' />");
        input.val("Disabled");
        inputGroup.append(input);
        const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
        removeButton.on("click", function () {
            helmetGeoVisFemale.splice(i, 1);
            reloadHelmetGeovisComponents();
            previewCustomItem();
        });
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $("#geoSetOverrideSection2 .accordion-body").append(formGroup);
    }
    const buttonF = $("<button id='addGsOverrideF' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Geoset Override</button>")
    buttonF.on("click", function () {
        $("#ci_helmetgeovis_gender").val("1");
    });
    $("#geoSetOverrideSection2 .accordion-body").append(buttonF);
}

async function reloadCharacterModel() {
    if (window.model) {
        window.model.destroy();
    }

    const fullCharOptions = await findRaceGenderOptions(character.race, character.gender);

    const options = [];
    for (const opt of fullCharOptions.Options) {
        const i = character.customizations.findIndex((x) => x.optionId === opt.Id);
        if (i > -1) {
            options.push(character.customizations[i]);
        } else {
            options.push({
                optionId: opt.Id,
                choiceId: opt.Choices[0].Id
            })
        }
    }

    const modelData: ZamModelViewerInitData = {
        type: 2,
        contentPath: window.CONTENT_PATH,
        container: $("#model_3d"),
        aspect: ($("#model_3d").width() / 600),
        hd: true,
        items: [],
        charCustomization: {
            options
        },
        models: {
            id: character.race * 2 - 1 + character.gender,
            type: 16
        }
    }
    const wowModelViewer = await new WowModelViewer(modelData);
    window.model = wowModelViewer;
    previewCustomItem();
}

function loadItem() {
    let inventoryType = parseInt($("#ci_item_inventoryType").val().toString(), 10);
    let displayId = parseInt($("#ci_item_displayId").val().toString(), 10)

    $.LoadingOverlay("show");

    $.ajax({
        url: window.EXPRESS_URI + "/zam/modelviewer/live/meta/armor/" + inventoryType + "/" + displayId + ".json",
        method: "GET",
        error: function () {
            $.LoadingOverlay("hide");
        },
        success: function (data: ZamItemData) {
            $("#ci_inventoryslot").val(inventoryType);
            onInventorySlotChange();

            let promises = [];
            // Load geosetdata
            const sets = getGeoSetsForInventoryType(inventoryType);
            for (let i = 0; i < sets.length; i++) {
                $("#ci_geoset_" + sets[i]).val(data.Item.GeosetGroup[i]);
            }

            // Load textures
            itemMaterials = {};
            for (const section in data.ComponentTextures) {
                for (const texture of data.TextureFiles[data.ComponentTextures[section]])
                {
                    promises.push(window.db.get(`
                        SELECT * FROM texturefiles 
                        WHERE fileId = ?1
                        LIMIT 1`, 
                        texture.FileDataId
                    ).then((resp) => {
                        if (resp.error) {
                            throw resp.error;
                        }
                        const data = resp.result as TextureFileData;
                        const textureData = {
                            fileName: data.fileName,
                            fileId: data.fileId,
                            race: texture.Race,
                            class: texture.Class,
                            gender: texture.Gender
                        }
                        if (itemMaterials[section]) {
                            itemMaterials[section].push(textureData);
                        } else {
                            itemMaterials[section] = [textureData];
                        }
                        reloadTexturesComponents();
                    }));
                }
            }
            reloadTexturesComponents();


            //  Load component data
            itemComponentModels = {
                "0": {
                    texture: {
                        id: -1,
                        name: ""
                    },
                    models: []
                },
                "1": {
                    texture: {
                        id: -1,
                        name: ""
                    },
                    models: []
                }
            };
            for (const componentId in data.ComponentModels) {
                const models = data.ModelFiles[data.ComponentModels[componentId]];
                for (const modelData of models) {
                    promises.push(window.db.get(`
                        SELECT * FROM modelresources 
                        WHERE fileId = ?1
                        LIMIT 1`, 
                        modelData.FileDataId
                    ).then((resp) => {
                        if (resp.error) {
                            throw resp.error;
                        }
                        const data = resp.result as TextureFileData;
                        const model = {
                            fileName: data.fileName,
                            fileId: data.fileId,
                            race: modelData.Race,
                            class: modelData.Class,
                            gender: modelData.Gender,
                            extraData: modelData.ExtraData
                        }
                        itemComponentModels[componentId].models.push(model);
                        reloadComponentModelsComponents();
                    }));
                }
                let textureId = (componentId === "0") ? data.Textures["2"] : data.Textures2["2"];
                promises.push(window.db.get(`
                    SELECT * FROM texturefiles 
                    WHERE fileId = ?1
                    LIMIT 1`, 
                    textureId
                ).then((resp) => {
                    if (resp.error) {
                        throw resp.error;
                    }
                    const data = resp.result as TextureFileData;
                    const textureData = {
                        name: data.fileName,
                        id: data.fileId
                    }
                    itemComponentModels[componentId].texture = textureData;
                    reloadComponentModelsComponents();
                }));
            }

            reloadComponentModelsComponents();

            // Load particle color data
            particleColors = [];
            if (data.Item.ParticleColor !== null) {
                particleColors.push([data.Item.ParticleColor.Start[0], data.Item.ParticleColor.Mid[0], data.Item.ParticleColor.End[0]])
                particleColors.push([data.Item.ParticleColor.Start[1], data.Item.ParticleColor.Mid[1], data.Item.ParticleColor.End[1]])
                particleColors.push([data.Item.ParticleColor.Start[2], data.Item.ParticleColor.Mid[2], data.Item.ParticleColor.End[2]])
            }
            reloadParticleColorComponents();

            // Load flags
            flags = data.Item.Flags;
            reloadFlagsComponents();

            // Load helmet geoset overrides
            helmetGeoVisMale = [];
            helmetGeoVisFemale = [];
            if (data.Item.HideGeosetMale !== null) {
                helmetGeoVisMale = data.Item.HideGeosetMale.map(
                    x => ({ race: x.RaceId, group: x.GeosetGroup })
                )
            }
            if (data.Item.HideGeosetFemale !== null) {
                helmetGeoVisFemale = data.Item.HideGeosetFemale.map(
                    x => ({ race: x.RaceId, group: x.GeosetGroup })
                )
            }
            reloadHelmetGeovisComponents();

            // Await loading all data:
            Promise.all(promises).then(() => {
                $.LoadingOverlay("hide");
                previewCustomItem();
            })
        }
    })
    $("#ci_item_search").val("");
    $("#ci_item_displayId").val("");
    $("#ci_item_inventoryType").val("");
    $("#loadItemBtn").attr('disabled', 'true');
}

function loadFile() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    // document.append(fileInput);
    fileInput.onchange = function () {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            try {
                const data = JSON.parse(reader.result as string);
                $("#ci_inventoryslot").val(data.inventoryType);
                onInventorySlotChange();

                itemMaterials = data.itemMaterials;
                itemComponentModels = data.itemComponentModels;
                particleColors = data.particleColors;
                helmetGeoVisMale = data.helmetGeoVisMale;
                helmetGeoVisFemale = data.helmetGeoVisFemale;
                flags = data.flags;

                const sets = getGeoSetsForInventoryType(data.inventoryType);
                for (let i = 0; i < sets.length; i++) {
                    $("#ci_geoset_" + sets[i]).val(data.geoSetGroup[i])
                }
                reloadTexturesComponents();
                reloadComponentModelsComponents();
                reloadFlagsComponents();
                reloadParticleColorComponents();
                reloadHelmetGeovisComponents();
                previewCustomItem();

                $.LoadingOverlay("hide");
            } catch {
                $("#alertError").text("Could not load data from file.").show();
                $.LoadingOverlay("hide");
            }
            // document.removeChild(fileInput);
        }, false);
        if (file) {
            reader.readAsText(file);
            $.LoadingOverlay("show");
        }
    }
    fileInput.click();
}

function previewCustomItem() {
    let inventorySlot = parseInt($("#ci_inventoryslot").val().toString(), 10);
    window.WH.debug("Creating custom item for inventory slot: ", inventorySlot);
    const data: ZamItemData = {
        "Model": 0,
        "Textures": null,
        "Textures2": null,
        "TextureFiles": {

        },
        "ModelFiles": {

        },
        "Item": {
            "Flags": flags,
            "InventoryType": inventorySlot,
            "ItemClass": 4,
            "ItemSubClass": 5,
            "HideGeosetMale": null,
            "HideGeosetFemale": null,
            "GeosetGroup": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "AttachGeosetGroup": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "GeosetGroupOverride": 0,
            "ParticleColor": null
        },
        "Creature": null,
        "Character": null,
        "ItemEffects": null,
        "Equipment": null,
        "ComponentTextures": {
        },
        "ComponentModels": {
        },
        "StateKit": null,
        "StateKits": null,
        "Scale": 1.0
    }

    // Set Geoset data
    const sets = getGeoSetsForInventoryType(inventorySlot);
    for (let i = 0; i < sets.length; i++) {
        data.Item.GeosetGroup[i] = parseInt($("#ci_geoset_" + sets[i]).val().toString(), 10);
    }

    // Set Textures
    for (const sectionStr in itemMaterials) {
        const textures = itemMaterials[sectionStr]
        const section = parseInt(sectionStr, 10);
        data.TextureFiles[sectionStr] = textures.map((x) => ({
            "FileDataId": x.fileId,
            "Gender": x.gender,
            "Race": x.race,
            "Class": x.class,
            "ExtraData": 0
        }));
        data.ComponentTextures[section] = section;
    }


    // Set Item Components
    for (const idStr in itemComponentModels) {
        if (itemComponentModels[idStr].models.length) {
            data.ComponentModels[idStr] = +idStr + 1;
            data.ModelFiles[+idStr + 1] = itemComponentModels[idStr].models
                .map(x => ({
                    "FileDataId": x.fileId,
                    "Gender": x.gender,
                    "Class": x.class,
                    "Race": x.race,
                    "ExtraData": x.extraData
                }));
        }
        if (itemComponentModels[idStr].texture.id > 0) {
            const textureData = {
                "2": itemComponentModels[idStr].texture.id
            }
            if (idStr == "0") {
                data.Textures = textureData;
            } else {
                data.Textures2 = textureData;
            }
        }
    }

    // Set Particle Color Override
    if (particleColors.length > 0) {
        data.Item.ParticleColor = {
            Id: 1234,
            Start: [],
            Mid: [],
            End: []
        }
        for (let i = 0; i < particleColors.length; i++) {
            data.Item.ParticleColor.Start[i] = particleColors[i][0];
            data.Item.ParticleColor.Mid[i] = particleColors[i][1];
            data.Item.ParticleColor.End[i] = particleColors[i][2];
        }
    }

    // Set Geovis overrides
    if (inventorySlot === window.WH.Wow.Item.INVENTORY_TYPE_HEAD && helmetGeoVisMale.length > 0) {
        data.Item.HideGeosetMale = helmetGeoVisMale.map(
            x => ({ RaceId: x.race, GeosetGroup: x.group })
        )
    }
    if (inventorySlot === window.WH.Wow.Item.INVENTORY_TYPE_HEAD && helmetGeoVisFemale.length > 0) {
        data.Item.HideGeosetFemale = helmetGeoVisFemale.map(
            x => ({ RaceId: x.race, GeosetGroup: x.group })
        )
    }

    window.model.setCustomItem(inventorySlot, data);
}

function exportToFile() {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(getItemData())], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = "myCustomItem.json";
    a.click();
}

function getItemData() {
    const inventoryType = parseInt($("#ci_inventoryslot").val().toString(), 10);
    const data: ItemData = {
        inventoryType,
        itemMaterials,
        itemComponentModels,
        particleColors,
        helmetGeoVisMale,
        helmetGeoVisFemale,
        flags,
        geoSetGroup: [0, 0, 0, 0, 0]
    }

    const sets = getGeoSetsForInventoryType(inventoryType);
    for (let i = 0; i < sets.length; i++) {
        data.geoSetGroup[i] = parseInt($("#ci_geoset_" + sets[i]).val().toString(), 10);
    }
    return data;
}

$(function () {
    $("#previewBtn").on("click", previewCustomItem);

    $("#ci_inventoryslot").on("change", onInventorySlotChange);
    onInventorySlotChange();

    $("#ci_texture_textureFile").on("keyup", debounce(onSearchTexture));
    $("#addTextureBtn").on("click", onAddTexture);

    $("#ci_item_search").on("keyup", debounce(onSearchItem));
    $("#loadItemBtn").on("click", loadItem);

    $("#component1AddModelBtn").on("click", function () {
        $("#ci_component_id").val("0")
    });
    $("#component1AddTextureBtn").on("click", function () {
        $("#ci_component_id").val("0")
    });
    $("#component2AddModelBtn").on("click", function () {
        $("#ci_component_id").val("1")
    });
    $("#component2AddTextureBtn").on("click", function () {
        $("#ci_component_id").val("1")
    });

    $("#ci_componenttexture_file").on("keyup", debounce(onSearchComponentTexture));
    $("#ci_componentmodel_modelfile").on("keyup", debounce(onSearchComponentModel));

    $("#addComponentTextureBtn").on("click", onAddComponentTexture);
    $("#addComponentModelBtn").on("click", onAddComponentModel);

    $("#setParticleOverride").on("click", onSetParticleColors);

    $("#addHelmetGeoVis").on("click", onAddGeoSetOverride);

    $("#exportBtn").on("click", exportToFile);
    $("#loadFileBtn").on("click", loadFile);

    $("#ci_model_gender").on("change", onModelGenderChange)
    $("#ci_model_race").on("change", onModelRaceChange)
    // $("#loadCharacterBtn").on("click", onLoadCharacter);

    $("#ci_model_gender").val(character.gender);
    $("#ci_model_race").val(character.race);

    $("#randomizeItemBtn").on("click", onRandomizeItem)

    $("#component1RandomizeModelBtn").on("click", onRandomizeComponent1Model);
    $("#component2RandomizeModelBtn").on("click", onRandomizeComponent2Model);
    $("#component1RandomizeTextureBtn").on("click", onRandomizeComponent1Texture);
    $("#component2RandomizeTextureBtn").on("click", onRandomizeComponent2Texture);

    $("#patchWoWBtn").on("click", () => {
        $.LoadingOverlay("show");
        window.api.applyItemPatch(getItemData(), "My Awesome Item").then((output) => {
            $.LoadingOverlay("hide");
            if (output.resultCode != 0) {
                $("#alertError")
                    .empty()
                    .append("Something went wrong applying the patch to the WoW clientfiles. Please contact a developer for help!")
                    .show();
            } else {
                $("#alertError")
                    .empty()
                    .hide();
            }
        });
    });

    reloadFlagsComponents();
    reloadHelmetGeovisComponents();
    // loadAvailableCharacters();
    reloadCharacterModel();
})

$(window).on("resize", debounce(reloadCharacterModel));