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
        case 16: { return 259431; }
        case 19: { return 259432; }
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
    }
}
