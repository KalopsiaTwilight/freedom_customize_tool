import { inventoryTypeToItemClassId } from "../../utils";

export async function previewCustomItem() {
    if (!window.model) {
        return;
    }

    const item = await window.store.get("itemData");

    const data: ZamItemData = {
        "Model": 0,
        "Textures": null,
        "Textures2": null,
        "TextureFiles": {

        },
        "ModelFiles": {

        },
        "Item": {
            "Flags": item.flags,
            "InventoryType": item.inventoryType,
            "ItemClass": inventoryTypeToItemClassId(item.inventoryType),
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
    data.Item.GeosetGroup = item.geoSetGroup

    // Set Textures
    for (const sectionStr in item.itemMaterials) {
        const textures = item.itemMaterials[sectionStr]
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
    for (const idStr in item.itemComponentModels) {
        if (item.itemComponentModels[idStr].models.length) {
            data.ComponentModels[idStr] = +idStr + 1;
            data.ModelFiles[+idStr + 1] = item.itemComponentModels[idStr].models
                .map(x => ({
                    "FileDataId": x.fileId,
                    "Gender": x.gender,
                    "Class": x.class,
                    "Race": x.race,
                    "ExtraData": x.extraData
                }));
        }
        if (item.itemComponentModels[idStr].texture.id > 0) {
            const textureData = {
                "2": item.itemComponentModels[idStr].texture.id
            }
            if (idStr == "0") {
                data.Textures = textureData;
            } else {
                data.Textures2 = textureData;
            }
        }
    }

    // Set Particle Color Override
    if (item.particleColors.length > 0) {
        data.Item.ParticleColor = {
            Id: 1234,
            Start: [],
            Mid: [],
            End: []
        }
        for (let i = 0; i < item.particleColors.length; i++) {
            data.Item.ParticleColor.Start[i] = item.particleColors[i][0];
            data.Item.ParticleColor.Mid[i] = item.particleColors[i][1];
            data.Item.ParticleColor.End[i] = item.particleColors[i][2];
        }
    }

    // Set Geovis overrides
    if (item.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_HEAD && item.helmetGeoVisMale.length > 0) {
        data.Item.HideGeosetMale = item.helmetGeoVisMale.map(
            x => ({ RaceId: x.race, GeosetGroup: x.group })
        )
    }
    if (item.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_HEAD && item.helmetGeoVisFemale.length > 0) {
        data.Item.HideGeosetFemale = item.helmetGeoVisFemale.map(
            x => ({ RaceId: x.race, GeosetGroup: x.group })
        )
    }

    window.model.setCustomItem(item.inventoryType, data);
}