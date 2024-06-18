import { ItemData, ItemToDisplayIdData, TextureFileData } from "../../models";
import { notifyError } from "../../utils/alerts";

import { reloadAllSections } from "./item-setup";
import { randomizeComponentModel, reloadComponentModels } from "./item-component-models";
import { randomizeComponentTexture, reloadComponentTextures } from "./item-component-textures";
import { randomizeGeoSetData, reloadGeosetDisplay } from "./item-geoset-display";
import { randomizeTextures, reloadTextures } from "./item-texture";
import { previewCustomItem } from "./preview-item";

export async function onSearchItem() {
    const resp = await window.db.all(`
        SELECT * FROM item_to_displayid 
        WHERE itemName like '%'|| ?1 || '%'
        OR itemId LIKE '%' || ?1 || '%'
        LIMIT 5`,
        $("#ci_item_search").val()
    );
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
}

export async function loadItem() {
    let inventoryType = parseInt($("#ci_item_inventoryType").val().toString(), 10);
    let displayId = parseInt($("#ci_item_displayId").val().toString(), 10)

    $.LoadingOverlay("show");
    $.ajax({
        url: window.EXPRESS_URI + "/zam/modelviewer/live/meta/armor/" + inventoryType + "/" + displayId + ".json",
        method: "GET",
        error: function () {
            $.LoadingOverlay("hide");
        },
        success: async function (data: ZamItemData) {
            const itemData = await window.store.get('itemData');
            itemData.inventoryType = inventoryType;
            itemData.geoSetGroup = data.Item.GeosetGroup;
            
            // Load textures
            itemData.itemMaterials = {};
            for (const section in data.ComponentTextures) {
                for (const texture of data.TextureFiles[data.ComponentTextures[section]])
                {
                    const resp = await window.db.get(`
                        SELECT * FROM texturefiles 
                        WHERE fileId = ?1
                        LIMIT 1`, 
                        texture.FileDataId
                    )
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
                    if (itemData.itemMaterials[section]) {
                        itemData.itemMaterials[section].push(textureData);
                    } else {
                        itemData.itemMaterials[section] = [textureData];
                    }
                }
            }

            //  Load component data
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
            for (const componentId in data.ComponentModels) {
                const models = data.ModelFiles[data.ComponentModels[componentId]];
                for (const modelData of models) {
                    const resp = await window.db.get(`
                        SELECT * FROM modelresources 
                        WHERE fileId = ?1
                        LIMIT 1`, 
                        modelData.FileDataId
                    )
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
                    itemData.itemComponentModels[componentId].models.push(model);
                }
                let textureId = (componentId === "0") ? data.Textures["2"] : data.Textures2["2"];
                const resp = await window.db.get(`
                    SELECT * FROM texturefiles 
                    WHERE fileId = ?1
                    LIMIT 1`, 
                    textureId
                )
                if (resp.error) {
                    throw resp.error;
                }
                const dbData = resp.result as TextureFileData;
                const textureData = {
                    name: dbData.fileName,
                    id: dbData.fileId
                }
                itemData.itemComponentModels[componentId].texture = textureData;
            }

            // Load particle color data
            itemData.particleColors = [];
            if (data.Item.ParticleColor !== null) {
                itemData.particleColors.push([data.Item.ParticleColor.Start[0], data.Item.ParticleColor.Mid[0], data.Item.ParticleColor.End[0]])
                itemData.particleColors.push([data.Item.ParticleColor.Start[1], data.Item.ParticleColor.Mid[1], data.Item.ParticleColor.End[1]])
                itemData.particleColors.push([data.Item.ParticleColor.Start[2], data.Item.ParticleColor.Mid[2], data.Item.ParticleColor.End[2]])
            }

            // Load flags
            itemData.flags = data.Item.Flags;

            // Load helmet geoset overrides
            itemData.helmetGeoVisMale = [];
            itemData.helmetGeoVisFemale = [];
            if (data.Item.HideGeosetMale !== null) {
                itemData.helmetGeoVisMale = data.Item.HideGeosetMale.map(
                    x => ({ race: x.RaceId, group: x.GeosetGroup })
                )
            }
            if (data.Item.HideGeosetFemale !== null) {
                itemData.helmetGeoVisFemale = data.Item.HideGeosetFemale.map(
                    x => ({ race: x.RaceId, group: x.GeosetGroup })
                )
            }

            await window.store.set('itemData', itemData);
            await reloadAllSections(inventoryType);
            $.LoadingOverlay("hide");
            await previewCustomItem();
        }
    })
    $("#ci_item_search").val("");
    $("#ci_item_displayId").val("");
    $("#ci_item_inventoryType").val("");
    $("#loadItemBtn").attr('disabled', 'true');
}

export async function loadFile() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    // document.append(fileInput);
    fileInput.onchange = function () {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", async () => {
            try {
                const data = JSON.parse(reader.result as string) as ItemData;
                await window.store.set('itemData', data);

                await reloadAllSections(data.inventoryType);
                await previewCustomItem();
                $.LoadingOverlay("hide");
            } catch {
                notifyError("Could not load data from file.")
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

export async function exportToFile() {
    const itemData = await window.store.get('itemData');
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(itemData)], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = "myCustomItem.json";
    a.click();
}

export async function onRandomizeItem() {
    $.LoadingOverlay("show");
    await randomizeGeoSetData();
    await randomizeTextures();
    await randomizeComponentModel("0");
    await randomizeComponentModel("1");
    await randomizeComponentTexture("0");
    await randomizeComponentTexture("1");

    await reloadGeosetDisplay();
    await reloadTextures();
    await reloadComponentModels();
    await reloadComponentTextures();
    await previewCustomItem();
    $.LoadingOverlay("hide");
}

