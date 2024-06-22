export function inventoryTypeToItemSlot(type: number) {
    switch(type) {
        case 1: { return 0;}
        case 3: { return 1;}
        case 4: { return 2;}
        case 5: { return 3; }
        case 6: { return 4; }
        case 7: { return 5; }
        case 8: { return 6; }
        case 9: { return 7; }
        case 10: { return 8; }
        case 16: { return 10; }
        case 19: { return 9; }
        case 27: { return 11; }
        case 13: { return 11; }
        case 17: { return 11; }
        case 14: { return 13; }
        case 23: { return 11; }
        case 15: { return 12; }
    }
}

export function inventoryTypeToItemId(type: number) {
    switch(type) {
        case 1: { return 259422;}
        case 3: { return 259423;}
        case 4: { return 259424;}
        case 5: { return 259425; }
        case 6: { return 259426; }
        case 7: { return 259427; }
        case 8: { return 259428; }
        case 9: { return 259429; }
        case 10: { return 259430; }
        case 13: { return 259433; }
        case 14: { return 259435; }
        case 15: { return 259437; }
        case 16: { return 259431; }
        case 17: { return 259434; }
        case 19: { return 259432; }
        case 23: { return 259436; }
    }
}

export function inventoryTypeToItemSlotName(type: number) {
    switch(type) {
        case 1: { return "Head";}
        case 3: { return "Shoulders";}
        case 4: { return "Shirt";}
        case 5: { return "Chest"; }
        case 6: { return "Waist"; }
        case 7: { return "Legs"; }
        case 8: { return "Feet"; }
        case 9: { return "Wrists"; }
        case 10: { return "Hands"; }
        case 16: { return "Back"; }
        case 19: { return "Tabard"; }
        case 13: { return "One Hand"; }
        case 17: { return "Two Hand"; }
        case 14: { return "Shield"; }
        case 23: { return "Off Hand"; }
        case 15: { return "Ranged"; }
    }
}

export function isArmorInventoryType(type: number) {
    switch(type) {
        case window.WH.Wow.Item.INVENTORY_TYPE_BACK:
        case window.WH.Wow.Item.INVENTORY_TYPE_CHEST:
        case window.WH.Wow.Item.INVENTORY_TYPE_FEET:
        case window.WH.Wow.Item.INVENTORY_TYPE_HANDS:
        case window.WH.Wow.Item.INVENTORY_TYPE_HEAD:
        case window.WH.Wow.Item.INVENTORY_TYPE_LEGS:
        case window.WH.Wow.Item.INVENTORY_TYPE_ROBE:
        case window.WH.Wow.Item.INVENTORY_TYPE_SHIRT:
        case window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS:
        case window.WH.Wow.Item.INVENTORY_TYPE_TABARD:
        case window.WH.Wow.Item.INVENTORY_TYPE_WAIST:
        case window.WH.Wow.Item.INVENTORY_TYPE_WRISTS:
        case window.WH.Wow.Item.INVENTORY_TYPE_HELD_IN_OFF_HAND:
            return true;
        default:
            return false;
    }
}

export function isWeaponInventoryType(type: number) {
    switch(type) {
        case window.WH.Wow.Item.INVENTORY_TYPE_MAIN_HAND:
        case window.WH.Wow.Item.INVENTORY_TYPE_OFF_HAND:
        case window.WH.Wow.Item.INVENTORY_TYPE_ONE_HAND:
        case window.WH.Wow.Item.INVENTORY_TYPE_TWO_HAND:
            return true;
        default:
            return false;
    }
}

export function inventoryTypeToItemClassId(type: number) {
    switch (type) {
        case window.WH.Wow.Item.INVENTORY_TYPE_HEAD: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_NECK: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_SHIRT: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_CHEST: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_WAIST: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_LEGS: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_FEET: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_LEGS: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_WRISTS: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_HANDS: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_FINGER: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_TRINKET: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_ONE_HAND: return 2;
        case window.WH.Wow.Item.INVENTORY_TYPE_SHIELD: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_RANGED: return 2;
        case window.WH.Wow.Item.INVENTORY_TYPE_BACK: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_TWO_HAND: return 2;
        case window.WH.Wow.Item.INVENTORY_TYPE_TABARD: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_ROBE: return 4;
        case window.WH.Wow.Item.INVENTORY_TYPE_MAIN_HAND: return 2;
        case window.WH.Wow.Item.INVENTORY_TYPE_OFF_HAND: return 2;
        case window.WH.Wow.Item.INVENTORY_TYPE_HELD_IN_OFF_HAND: return 4;
    }
}