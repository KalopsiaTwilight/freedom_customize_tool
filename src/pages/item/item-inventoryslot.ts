import { ArmorSubclass, InventoryType } from "../../models";
import { isArmorInventoryType } from "../../utils";

import { reloadAllSections } from "./item-setup";
import { previewCustomItem } from "./preview-item";

export async function onInventorySlotChange() {
    const itemData = await window.store.get('itemData');

    const oldInventoryType = itemData.inventoryType;

    itemData.itemMaterials = {};
    itemData.itemComponentModels = {
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
    itemData.inventoryType = parseInt($("#ci_inventoryslot").val().toString(), 10);
    itemData.helmetGeoVisMale = [];
    itemData.helmetGeoVisFemale = [];
    itemData.geoSetGroup = [0,0,0,0,0];
    itemData.customTextures = [];

    if (isArmorInventoryType(itemData.inventoryType)) {
        itemData.metadata.sheatheType = 0;
        itemData.metadata.subClass = ArmorSubclass.Cloth
    }
    if (itemData.inventoryType == InventoryType.Shield) {
        itemData.metadata.subClass = ArmorSubclass.Shield
    }
    if (itemData.inventoryType == InventoryType.HeldInOffHand) {
        itemData.metadata.subClass = 0;
    }

    await window.store.set('itemData', itemData);

    await reloadAllSections(itemData.inventoryType);

    if (window.model) {
        await previewCustomItem();
    }
}