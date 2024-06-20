function getGeoSetsForInventoryType(inventoryType: number) {
    switch (inventoryType) {
        case window.WH.Wow.Item.INVENTORY_TYPE_HEAD: return [27, 21];
        case window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS: return [26];
        case window.WH.Wow.Item.INVENTORY_TYPE_SHIRT: return [8, 10];
        case window.WH.Wow.Item.INVENTORY_TYPE_CHEST: return [8, 10, 13, 22, 28];
        case window.WH.Wow.Item.INVENTORY_TYPE_WAIST: return [18];
        case window.WH.Wow.Item.INVENTORY_TYPE_LEGS: return [11, 9, 13];
        case window.WH.Wow.Item.INVENTORY_TYPE_FEET: return [5, 20];
        case window.WH.Wow.Item.INVENTORY_TYPE_HANDS: return [4, 23];
        case window.WH.Wow.Item.INVENTORY_TYPE_BACK: return [15];
        case window.WH.Wow.Item.INVENTORY_TYPE_TABARD: return [12];
        default: return [];
    }
}

function getComponentSectionsForInventoryType(inventoryType: number) {
    switch (inventoryType) {
        //case window.WH.Wow.Item.INVENTORY_TYPE_HEAD: return [1,2];
        case window.WH.Wow.Item.INVENTORY_TYPE_SHIRT: return [0,1,2,3,4,5,6];
        case window.WH.Wow.Item.INVENTORY_TYPE_CHEST: return [0,1,2,3,4,5,6];
        case window.WH.Wow.Item.INVENTORY_TYPE_WAIST: return [4,5];
        case window.WH.Wow.Item.INVENTORY_TYPE_LEGS: return [5,6,8];
        case window.WH.Wow.Item.INVENTORY_TYPE_FEET: return [6, 7];
        case window.WH.Wow.Item.INVENTORY_TYPE_WRISTS: return [1];
        case window.WH.Wow.Item.INVENTORY_TYPE_HANDS: return [1,2];
        case window.WH.Wow.Item.INVENTORY_TYPE_TABARD: return [3, 4, 5];
        case window.WH.Wow.Item.INVENTORY_TYPE_ROBE: return [1, 3, 4, 5, 6];
        case window.WH.Wow.Item.INVENTORY_TYPE_BACK: return [12];
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