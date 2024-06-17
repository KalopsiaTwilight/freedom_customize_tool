
import { reloadAllSections } from "./item-setup";
import { previewCustomItem } from "./preview-item";

export async function onInventorySlotChange() {
    const itemData = await window.store.get('itemData');

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

    await window.store.set('itemData', itemData);

    await reloadAllSections(itemData.inventoryType);

    if (window.model) {
        await previewCustomItem();
    }
}