import { Modal } from "bootstrap";

import { InventoryType, ItemData, ItemToDisplayIdData, TextureFileData } from "../../models";
import { notifyError } from "../../utils/alerts";
import { isArmorInventoryType } from "../../utils";

import { reloadAllSections } from "./item-setup";
import { randomizeComponentModel, reloadComponentModels } from "./item-component-models";
import { randomizeComponentTexture, reloadComponentTextures } from "./item-component-textures";
import { randomizeGeoSetData, reloadGeosetDisplay } from "./item-geoset-display";
import { randomizeTextures, reloadTextures } from "./item-texture";
import { previewCustomItem } from "./preview-item";
import { getWowHeadThumbForDisplayId } from "./wow-data-utils";
import { fallbackImg } from "./consts";

export async function onSearchItem() {
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 4;
    
    let whereAndFrom = `
        FROM item_to_displayid 
        WHERE (itemName like '%'|| ?1 || '%'
        OR itemId LIKE '%' || ?1 || '%')
    `;
    const inventoryTypeFilter = parseInt($("#ci_item_inventorySlotFilter").val().toString(), 10);
    if (inventoryTypeFilter >= 0) {
        whereAndFrom += `AND inventoryType = ${inventoryTypeFilter}`
    }
    const resp = await window.db.all<ItemToDisplayIdData>(`
        SELECT * ${whereAndFrom}
        ORDER BY itemId DESC
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}`,
        $("#ci_item_search").val()
    );
    if (resp.error) {
        throw resp.error;
    }
    const total = await window.db.get<{total: number}>(
        `SELECT COUNT(*) total ${whereAndFrom}`,
        $("#ci_item_search").val()
    );


    $("#ci_item_resultsPreview").empty();
    const row = $("<div class='row'>");
    for (const item of resp.result) {
        const col = $("<div class='col-6 mb-3'>");
        const linkElem = $("<a role='button' class='d-flex flex-column align-items-center border'>");
        const imgUri = getWowHeadThumbForDisplayId(item.itemDisplayId);
        const img = $(`<img src="${imgUri}" width=200 height=200 />`);
        linkElem.append(img);
        img.on('error', function () {
            $(this).attr('src', fallbackImg);
        })
        linkElem.append(`<p>${item.itemName}</p>`)
        linkElem.on("click", function () {
            loadItem(item.inventoryType, item.itemDisplayId);
            Modal.getOrCreateInstance("#loadItemModal").hide();
        });
        col.append(linkElem);
        row.append(col);
    }
    $("#ci_item_resultsPreview").append(row);
    const bottomContainer = $("<div class='d-flex justify-content-between align-items-center'>");
    const leftArrow = $("<button class='btn btn-light'><i class='fa-solid fa-arrow-left'></i></button>")
    if (page === 0) {
        leftArrow.attr('disabled', 'disabled');
    } else {
        leftArrow.on('click', prevPage);
    }
    const rightArrow = $("<button class='btn btn-light'><i class='fa-solid fa-arrow-right'></i></button>")
    if (page === Math.ceil(total.result.total/pageSize)-1) {
        rightArrow.attr('disabled', 'disabled');
    } else {
        rightArrow.on('click', nextPage)
    }
    bottomContainer.append(leftArrow);
    bottomContainer.append(`<p class="text-center mb-0">Showing results ${page * pageSize + 1}-${Math.min((page+1) * pageSize, total.result.total)} out of ${total.result.total}</p>`);
    bottomContainer.append(rightArrow);
    $("#ci_item_resultsPreview").append(bottomContainer);
}

function nextPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage + 1);
    onSearchItem();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchItem();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

export async function loadItem(inventoryType: InventoryType, displayId: number) {
    $.LoadingOverlay("show");

    const wowHeadUri = isArmorInventoryType(inventoryType) 
        ? `${window.EXPRESS_URI}/zam/modelviewer/live/meta/armor/${inventoryType}/${displayId}.json`
        : `${window.EXPRESS_URI}/zam/modelviewer/live/meta/item/${displayId}.json`

    $.ajax({
        url: wowHeadUri,
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
                if (!textureId) {
                    continue;
                }
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

