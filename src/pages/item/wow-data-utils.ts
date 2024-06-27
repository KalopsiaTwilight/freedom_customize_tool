import { InventoryType, ItemComponentSection, GeoSet } from "../../models";

function getGeoSetsForInventoryType(inventoryType: number) {
    switch (inventoryType) {
        case InventoryType.Head: return [GeoSet.Helmet, GeoSet.Head];
        case InventoryType.Shoulders: return [GeoSet.Shoulders];
        case InventoryType.Shirt: return [GeoSet.Sleeves, GeoSet.ShirtDoublet];
        case InventoryType.Chest: return [
            GeoSet.Sleeves, GeoSet.ShirtDoublet, GeoSet.LowerBody,
            GeoSet.Torso, GeoSet.ArmUpper
        ];
        case InventoryType.Waist: return [GeoSet.Belt];
        case InventoryType.Legs: return [GeoSet.PantDoublet, GeoSet.Legcuffs, GeoSet.LowerBody];
        case InventoryType.Feet: return [GeoSet.Boots, GeoSet.Feet];
        case InventoryType.Hands: return [GeoSet.Wrists, GeoSet.HandAttachments];
        case InventoryType.Back: return [GeoSet.Cloak];
        case InventoryType.Tabard: return [GeoSet.Tabard];
        default: return [];
    }
}

function getComponentSectionsForInventoryType(inventoryType: InventoryType) {
    switch (inventoryType) {
        //case InventoryType.Head: return [1,2];
        case InventoryType.Shirt: return [
            ItemComponentSection.UpperArm, ItemComponentSection.LowerArm,
            ItemComponentSection.Hand,
            ItemComponentSection.UpperTorso, ItemComponentSection.LowerTorso,
            ItemComponentSection.UpperLeg, ItemComponentSection.LowerLeg
        ];
        case InventoryType.Chest: return [
            ItemComponentSection.UpperArm, ItemComponentSection.LowerArm,
            ItemComponentSection.Hand,
            ItemComponentSection.UpperTorso, ItemComponentSection.LowerTorso,
            ItemComponentSection.UpperLeg, ItemComponentSection.LowerLeg
        ];
        case InventoryType.Waist: return [ 
            ItemComponentSection.LowerTorso, ItemComponentSection.UpperLeg
        ];
        case InventoryType.Legs: return [ 
            ItemComponentSection.UpperLeg, ItemComponentSection.LowerLeg,
            ItemComponentSection.Accessory
        ];
        case InventoryType.Feet: return [ 
            ItemComponentSection.LowerLeg, ItemComponentSection.Foot
        ];
        case InventoryType.Wrists: return [ ItemComponentSection.LowerArm ];
        case InventoryType.Hands: return [ 
            ItemComponentSection.LowerArm, ItemComponentSection.Hand
        ];
        case InventoryType.Tabard: return [
            ItemComponentSection.UpperTorso, ItemComponentSection.LowerTorso,
            ItemComponentSection.UpperLeg
        ];
        case InventoryType.Robe: return [
            ItemComponentSection.LowerArm,
            ItemComponentSection.UpperTorso, ItemComponentSection.LowerTorso,
            ItemComponentSection.UpperLeg, ItemComponentSection.LowerLeg
        ];;
        case InventoryType.Back: return [ ItemComponentSection.Cloak ];
        default: return [];
    }
}

function getRaceName(race: number) {
    switch (race) {
        case 0: return "All";
        case 1: return "Human";
        case 2: return "Orc";
        case 3: return "Dwarf";
        case 4: return "Night Elf";
        case 5: return "Undead";
        case 6: return "Tauren";
        case 7: return "Gnome";
        case 8: return "Troll";
        case 9: return "Goblin";
        case 10: return "Blood Elf";
        case 11: return "Draenei";
        case 12: return "Fel Orc";
        case 13: return "Naga";
        case 14: return "Broken";
        case 15: return "Skeleton";
        case 16: return "Vrykul";
        case 17: return "Tuskarr";
        case 18: return "Forest Troll";
        case 19: return "Taunka";
        case 20: return "Northrend Skeleton";
        case 21: return "Ice Troll";
        case 22: return "Worgen";
        case 23: return "Worgen (Human form)";
        case 24: return "Pandaren (N)";
        case 25: return "Pandaren (A)";
        case 26: return "Pandaren (H)";
        case 27: return "Nightborne";
        case 28: return "Highmountain Tauren";
        case 29: return "Void Elf";
        case 30: return "Lightforged Draenei";
        case 31: return "Zandalari Troll";
        case 32: return "Kul Tiran";
        case 33: return "Thin Human";
        case 34: return "Dark Iron Dwarf";
        case 35: return "Vulpera";
        case 36: return "Mag'har Orc";
        case 37: return "Mechagnome";
        default: return "Unknown";
    }
}

function getClassName(classId: number) {
    switch (classId) {
        case 0: return "All";
        case 1: return "Warrior";
        case 2: return "Paladin";
        case 3: return "Hunter";
        case 4: return "Rogue";
        case 5: return "Priest";
        case 6: return "Death Knight";
        case 7: return "Shaman";
        case 8: return "Mage";
        case 9: return "Warlock";
        case 10: return "Monk";
        case 11: return "Druid";
        case 12: return "Demon Hunter";
        default: return "Unknown";
    }
}

function getPlayerRaces(): number[] {
    return [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37
    ]
}

function getWowHeadThumbForDisplayId(displayId: number) {
    return `${window.EXPRESS_URI}/zam/modelviewer/live/webthumbs/item/${displayId & 255}/${displayId}.webp`;
}

export {
    getGeoSetsForInventoryType,
    getComponentSectionsForInventoryType,
    getRaceName,
    getClassName,
    getWowHeadThumbForDisplayId,
    getPlayerRaces
}

export const noComponentSupportedInventoryTypes = [
    InventoryType.Wrists,
    InventoryType.Shirt,
    InventoryType.Tabard,
]
export const component2SupportedInventoryTypes = [
    InventoryType.Back,
    InventoryType.Shoulders
]

export function componentSlotSupportedForInventoryType(inventoryType: InventoryType, slot: string) {
    if (inventoryType === InventoryType.Back && slot === "0") {
        return false;
    }
    if (noComponentSupportedInventoryTypes.indexOf(inventoryType) !== -1) {
        return false;
    }
    if (slot === "1" && component2SupportedInventoryTypes.indexOf(inventoryType) === -1) {
        return false;
    }
    return true;
}