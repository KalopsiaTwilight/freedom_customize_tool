export interface ItemData {
    metadata: ItemMetadata,
    inventoryType: InventoryType,
    itemMaterials: ItemMaterialContainer
    itemComponentModels: ItemComponentModelContainer
    particleColors: number[][]
    helmetGeoVisMale: ItemGeoSetData[]
    helmetGeoVisFemale: ItemGeoSetData[]
    flags: number
    geoSetGroup: number[],
    customTextures: CustomTextureData[],
}

export interface ItemMetadata 
{
    name: string;
    fileIconId: number;
    fileIconName: string;
    rarity: ItemRarity;
    subClass: ArmorSubclass | WeaponSubclass;
    sheatheType: SheatheStyle;
}

export interface ItemFileData {
    fileName: string;
    fileId: number;
    gender: number;
    race: number;
    class: number;
}

export interface ItemComponentModelModelData extends ItemFileData {
    extraData: number;
}

export interface ItemComponentModelData {
    texture: {
        id: number;
        name: string;
    }
    models: ItemComponentModelModelData[];
}

export interface ItemGeoSetData {
    group: number;
    race: number;
}

export interface GenderedItemGeoSetData extends ItemGeoSetData {
    gender: number;
}

export interface ItemMaterialContainer {
    [key:string]: ItemFileData[]
}

export interface ItemComponentModelContainer {
    [key: string]: ItemComponentModelData
}

export enum InventoryType {
    Head = 1,
    Neck = 2,
    Shoulders = 3,
    Shirt = 4,
    Chest = 5,
    Waist = 6,
    Legs = 7,
    Feet = 8,
    Wrists = 9,
    Hands = 10,
    Finger = 11,
    Trinket = 12,
    OneHand = 13,
    Shield = 14,
    Ranged = 15,
    Back = 16,
    TwoHand = 17,
    Bag = 18,
    Tabard = 19,
    Robe = 20,
    MainHand = 21,
    OffHand = 22,
    HeldInOffHand = 23,
    Projectile = 24,
    Thrown = 25,
    RangedRight = 26,
    Quiver = 27,
    Relic = 28,
    ProfessionTool = 29,
    ProfessionAccesory = 30
}

export enum ItemFeatureFlag
{
    EmblazonedTabard = 1,
    NoSheathedKit = 2,
    HidePantsAndBelt = 4,
    EmblazonedTabardRare = 8,
    EmblazonedTabardEpic = 16,
    UseSpearRangedWeaponAttachment = 32,
    InheritCharacterAnimation = 64,
    MirrorAnimasFomRightShoulderToLeft = 128,
    MirrorModelWhenEquippedonOffHand = 256,
    DisableTabardGeo = 512,
    MirrorModelWhenEquippedonMainHand = 1024,
    MirrorModelWhenSheathed = 2048,
    FlipModelWhenSheathed = 4096,
    UseAlternateWeaponTrailEndpoint = 8192,
    ForceSheathedifequippedasweapon = 16384,
    DontCloseHands = 32768,
    ForceUnsheathedforSpellCombatAnims = 65536,
    BrewmasterUnsheathe = 131072,
    HideBeltBuckle = 262144,
    NoDefaultBowstring = 524288,
    UnknownEffect1 = 1048576,
    UnknownEffect2 = 2097152,
    UnknownEffect3 = 4194304,
    UnknownEffect4 = 8388608,
    UnknownEffect5 = 16777216,
    UnknownEffect6 = 33554432,
    UnknownEffect7 = 67108864,
    UnknownEffect8 = 134217728
}

export enum ItemComponentSection {
    UpperArm = 0,
    LowerArm = 1,
    Hand = 2,
    UpperTorso = 3,
    LowerTorso = 4,
    UpperLeg = 5,
    LowerLeg = 6,
    Foot = 7,
    Accessory = 8,
    Cloak = 12
}

export enum GeoSet 
{
    Hair = 0,
    Facial = 1,
    Facial2 = 2,
    Facial3 = 3,
    Wrists = 4,
    Boots = 5,
    Shirt = 6,
    Ears = 7, 
    Sleeves = 8,
    Legcuffs = 9,
    ShirtDoublet = 10,
    PantDoublet = 11,
    Tabard = 12,
    LowerBody = 13,
    Loincloth = 14,
    Cloak = 15,
    FacialJewelry = 16,
    EyeEffects = 17,
    Belt = 18,
    SkinTail = 19,
    Feet = 20,
    Head = 21,
    Torso = 22,
    HandAttachments = 23,
    HeadAttachments = 24,
    Facewear = 25,
    Shoulders = 26,
    Helmet = 27,
    ArmUpper = 28,
    ArmReplace = 29,
    LegsReplace = 30,
    FeetReplace = 31,
    HeadSwapGeoset = 32,
    Eyes = 33,
    Eyebrows = 34,
    Piercings = 35,
    Necklaces = 36,
    Headdress = 37,
    Tail = 38,
    MiscAccesory = 39,
    MiscFeature = 40,
    Noses = 41,
    HairDecoration = 42,
    HornDecoration = 43
}

export interface GeoSetData
{
    title: string;
    options: GeoSetDataOption[];
}

export interface GeoSetDataOption
{
    name: string;
    value: number;
}

export enum ItemRarity 
{
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5,
    Artifact = 6,
    Heirloom = 7,
}

export enum ArmorSubclass {
    Misc = 0,
    Cloth = 1,
    Leather = 2,
    Mail = 3,
    Plate = 4,
    Cosmetic = 5,
    Shield = 6,
}

export enum WeaponSubclass {
    AxeOneHand = 0,
    AxeTwoHand = 1,
    Bow = 2,
    Gun = 3,
    MaceOneHand = 4,
    MaceTwoHand = 5,
    Polearm = 6,
    SwordOneHand = 7,
    SwordTwoHand = 8,
    Warglaives = 9,
    Staff = 10,
    Fist = 13,
    Misc = 14,
    Dagger = 15,
    Thrown = 16,
    Spear = 17,
    Crossbow = 18,
    Wand = 19,
    FishingPole = 20
}

export enum SheatheStyle
{
    BackOneHandInvis = 0,
    Back = 1,
    BackRotated = 2,
    Hip = 3,
    Bow = 4,
    Gun = 5,
    Hidden = 6,
    Hidden2 = 7,
    HiddenHip = 8,
}

export interface CustomTextureData 
{
    id: number,
    fileName: string,
    data: string,
    gender: number;
    race: number;
    class: number;
}