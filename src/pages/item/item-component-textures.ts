import { Modal, Tooltip } from "bootstrap"

import { notifyError } from "../../utils/alerts";
import { InventoryType, ItemFileData, TextureFileData } from "../../models";

import { previewCustomItem } from "./preview-item";
import { componentSlotSupportedForInventoryType } from "./wow-data-utils";
import { fallbackImg } from "./consts";
import { downloadTextureFile, freeUnusedCustomTextures, isCustomTexture, updateColorizePreview, uploadTextureFile } from "./shared";

export async function reloadComponentTextures() {
    const itemData = await window.store.get('itemData');

    $("#ci_componenttexture_file").val("");
    $("#ci_componenttexture_fileId").val("")
    $("#addComponentTextureBtn").attr('disabled', 'true');

    const domTargets = {
        "0": "#component1TexturesSection",
        "1": "#component2TexturesSection"
    } as { [key:string]: string }

    for(const id in domTargets) {
        $(`${domTargets[id]} .btn`).each((_, elem) => {
            const tt = Tooltip.getInstance(elem);
            if (tt) { tt.dispose(); }
        })
    }

    $(domTargets["0"]).empty();
    $(domTargets["1"]).empty();

    const unSupportedTypes = [
        InventoryType.Wrists,
        InventoryType.Shirt,
        InventoryType.Tabard
    ]
    if (unSupportedTypes.indexOf(itemData.inventoryType) !== -1) {
        return;
    }

    for (const idStr in itemData.itemComponentModels) {
        const data = itemData.itemComponentModels[idStr];
        const id = +idStr + 1;

        // Set Texture Content for Component
        const input = $("<input id='ci_componentModelTexture_" + id + "' class='form-control' readonly type='text' />");
        if (data.texture.id > 0) {
            input.val(`${data.texture.id} - ${data.texture.name}`);
        } else {
            input.val('None');
        }
        
        const inputGroup = $("<div class='input-group' />");
        inputGroup.append(input);

        const editButton = $("<button class='btn btn-outline-primary'"
            + "data-bs-toggle='modal' data-bs-target='#addComponentTextureModal'>"
            + "<i class='fa-solid fa-pencil'></i></button>"
        );
        editButton.on("click", function () {
            $("#ci_component_id").val(idStr);
            $("#ci_preview_page").val(0);
            $("#ci_componenttexture_file").val("");
            $("#ci_componenttexture_onlyForIs").prop('checked', false);
            onSearchComponentTexture();
        })
        $(inputGroup).append(editButton)

        const uploadTextureButton = $("<button class='btn btn-outline-secondary'>"
            + "<i class='fa-solid fa-upload'></i></button>");
        uploadTextureButton.on("click", onUploadTexture(idStr));
        inputGroup.append(uploadTextureButton);

        const downloadTextureButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-download'></i></button>");
        downloadTextureButton.on("click", onDownloadTexture(idStr));
        inputGroup.append(downloadTextureButton);

        const colorizeTextureButton = $("<button class='btn btn-outline-secondary'"
        + "data-bs-toggle='modal' data-bs-target='#hueShiftTextureModal'>"
        + "<i class='fa-solid fa-palette'></i></button>");
        colorizeTextureButton.on("click", onColorizeTexture(idStr));
        inputGroup.append(colorizeTextureButton);

        const softRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-shuffle'></i></button>");
        softRandomizeButton.on("click", async () => {
            $.LoadingOverlay("show");
            await randomizeComponentTexture(idStr);
            await reloadComponentTextures();
            await previewCustomItem();
            $.LoadingOverlay("hide");
        });
        inputGroup.append(softRandomizeButton)

        const hardRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-dice'></i></button>");
        hardRandomizeButton.on("click", async () => {
            $.LoadingOverlay("show");
            await hardRandomizeComponentTexture(idStr);
            await reloadComponentTextures();
            await previewCustomItem();
            $.LoadingOverlay("hide");
        });
        inputGroup.append(hardRandomizeButton)

        const removeButton = $("<button class='btn btn-outline-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on("click", onRemoveComponentTexture(idStr));
        inputGroup.append(removeButton)

        const formGroup = $("<div class='form-group mb-3' />");
        formGroup.append(inputGroup);
        $(domTargets[idStr]).append(formGroup)

        new Tooltip(editButton[0], { title: 'Edit' });
        new Tooltip(uploadTextureButton[0], { title: 'Upload Texture'});
        new Tooltip(downloadTextureButton[0], { title: 'Download Texture'});
        new Tooltip(softRandomizeButton[0], { title: 'Soft Randomize' });
        new Tooltip(hardRandomizeButton[0], { title: 'Hard Randomize' });
        new Tooltip(removeButton[0], { title: 'Remove'})
    }
}

function onRemoveComponentTexture(idStr: string) {
    return async function () {
        const itemData = await window.store.get('itemData');
        itemData.itemComponentModels[idStr].texture = {
            id: -1,
            name: ""
        };
        await window.store.set('itemData', itemData);
        await reloadComponentTextures();
        await previewCustomItem();
    }
}

async function onAddComponentTexture(fileName: string, fileId: number) {
    const modelSupported = await testZamSupportTexture(fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the texture you selected isn't supported anymore, please select a new texture.")
        return;
    }

    const itemData = await window.store.get('itemData');
    const componentId = $("#ci_component_id").val().toString();
    const textureData = {
        name: fileName,
        id: fileId
    };
    itemData.itemComponentModels[componentId].texture = textureData;
    await window.store.set('itemData', itemData);
    await reloadComponentTextures();
    await previewCustomItem();
}

export async function onSearchComponentTexture() {
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 4;

    const ctes = `
        WITH matchingItems AS
        (
            SELECT TF1.*
            FROM texturefiles TF1
        WHERE 
        (
                TF1.fileName like '%'|| ?1 || '%'
                OR TF1.fileId LIKE '%' || ?1 || '%'
                OR TF1.fileId IN (
                SELECT DITF.fileId
                FROM item_to_displayid IDI
                JOIN displayid_to_texturefile DITF ON DITF.displayId = IDI.itemDisplayId
                WHERE IDI.itemName LIKE '%' || ?1 || '%'
            )
            )
        )
    `
    let fromAndWhere = `
        FROM matchingItems MI
        WHERE MI.fileId IN (
            SELECT MIN(fileId)
            FROM matchingItems MI2
            GROUP BY MI2.materialResourceId
            HAVING COUNT(*) = 1
        )
    `;
    const inventoryTypeFilter = parseInt($("#ci_componenttexture_inventorySlotFilter").val().toString(), 10);
    if (inventoryTypeFilter >= 0) {
        fromAndWhere += `               
            AND MI.fileId IN (
                SELECT DITF.fileId
                FROM item_to_displayid IDI
                JOIN displayid_to_texturefile DITF ON IDI.itemDisplayId = DITF.displayId
                WHERE IDI.inventoryType = ${inventoryTypeFilter}
            )`
    }
    const resp = await window.db.all<TextureFileData>(`
        ${ctes}
        SELECT *
        ${fromAndWhere}
        ORDER BY fileId DESC
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}`,
        $("#ci_componenttexture_file").val()
    );
    if (resp.error) {
        throw resp.error;
    }

    const total = await window.db.get<{total: number}>(
        `${ctes} SELECT COUNT(*) total ${fromAndWhere}`,
        $("#ci_componenttexture_file").val()
    );
    
    $("#ci_componentTexture_resultsPreview").empty();
    const row = $("<div class='row'>");
    for (const texture of resp.result) {
        const col = $("<div class='col-6 mb-3'>");
        const linkElem = $("<a role='button' class='d-flex flex-column align-items-center border'>");
        const imgUri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${texture.fileId}.webp`
        const img = $(`<img src="${imgUri}" width=200 height=200 />`);
        linkElem.append(img);
        img.on('error', function () {
            $(this).attr('src', fallbackImg);
        })
        linkElem.append(`<p class="text-truncate" style="max-width: 90%">${texture.fileName}</p>`)
        linkElem.on("click", function () {
            onAddComponentTexture(texture.fileName, texture.fileId);
            Modal.getOrCreateInstance("#addComponentTextureModal").hide();
        });
        col.append(linkElem);
        row.append(col);
    }
    $("#ci_componentTexture_resultsPreview").append(row);
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
    $("#ci_componentTexture_resultsPreview").append(bottomContainer);
}

function nextPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage + 1);
    onSearchComponentTexture();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchComponentTexture();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

export async function onRandomizeComponent1Texture() {
    $.LoadingOverlay("show");
    await randomizeComponentTexture("0");
    await reloadComponentTextures();
    await previewCustomItem();
    $.LoadingOverlay("hide");
}

export async function onRandomizeComponent2Texture() {
    $.LoadingOverlay("show");
    await randomizeComponentTexture("1");
    await reloadComponentTextures();
    await previewCustomItem();
    $.LoadingOverlay("hide");
}

export async function randomizeComponentTexture(slot: string) {
    const itemData = await window.store.get('itemData');
    let data: TextureFileData | null = null;
    const maxTries = 10;
    let nrTries = 0;
    while (!data && nrTries < maxTries) {
        const resp = await window.db.get(`
            WITH mrIds as (
                SELECT DISTINCT materialResourceId
                FROM texturefiles
                WHERE fileId IN (
                    SELECT DITF.fileId
                    FROM item_to_displayid IDI
                    JOIN displayid_to_texturefile DITF ON DITF.displayId = IDI.itemDisplayId
                    WHERE IDI.inventoryType ${
                        itemData.inventoryType === InventoryType.Chest ?
                            "IN (4,5,20)" :
                        itemData.inventoryType === InventoryType.OneHand ? 
                            "IN (13, 21, 22)" : "= " + itemData.inventoryType 
                    }
                )
                GROUP BY materialResourceId
                HAVING COUNT(*) = 1
            ),
            nrdMrIds as (
            SELECT materialResourceId, ROW_NUMBER() OVER (
                    ORDER BY materialResourceId
                ) RowNum 
                FROM mrIds
            ),
            randomMrId as (
                SELECT materialResourceId FROM nrdMrIds
                WHERE RowNum = ROUND(? * (SELECT MAX(RowNum) FROM nrdMrIds) + 0.5)
            )
            SELECT * FROM texturefiles WHERE materialResourceId = (SELECT * FROM randomMrId)`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        data = resp.result as TextureFileData;
        const supported = await testZamSupportTexture(data.fileId);
        if (!supported) {
            data = null;
        }
        nrTries++;
    }
    if (nrTries === maxTries) {
        notifyError("Unable to get a random component texture! Please report this to a developer!");
        return;
    }
    
    itemData.itemComponentModels[slot].texture = {
        name: data.fileName,
        id: data.fileId
    }
    await window.store.set('itemData', itemData);
}

export async function hardRandomizeComponentTexture(slot: string) {
    const itemData = await window.store.get('itemData');
    if (!componentSlotSupportedForInventoryType(itemData.inventoryType, slot)) {
        return;
    }
    
    let data: TextureFileData | null = null;
    const maxTries = 10;
    let nrTries = 0;
    while (!data && nrTries < maxTries) {
        const resp = await window.db.get(`
            WITH mrIds as (
                SELECT DISTINCT materialResourceId
                FROM texturefiles
                GROUP BY materialResourceId
                HAVING COUNT(*) = 1
            ),
            nrdMrIds as (
            SELECT materialResourceId, ROW_NUMBER() OVER (
                    ORDER BY materialResourceId
                ) RowNum 
                FROM mrIds
            ),
            randomMrId as (
                SELECT materialResourceId FROM nrdMrIds
                WHERE RowNum = ROUND(? * (SELECT MAX(RowNum) FROM nrdMrIds) + 0.5)
            )
            SELECT * FROM texturefiles WHERE materialResourceId = (SELECT * FROM randomMrId)`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        data = resp.result as TextureFileData;
        const supported = await testZamSupportTexture(data.fileId);
        if (!supported) {
            data = null;
        }
        nrTries++;
    }    
    if (nrTries === maxTries) {
        notifyError("Unable to get a random component texture! Please report this to a developer!");
        return;
    }
   
    itemData.itemComponentModels[slot].texture = {
        name: data.fileName,
        id: data.fileId
    }
    await window.store.set('itemData', itemData);
}

async function testZamSupportTexture(fileId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${fileId}.webp`
    const resp = await fetch(uri);
    return resp.ok;
}

function onUploadTexture(componentId: string) {
    return async () => {
        const files = await window.api.selectFile([ {
            'extensions': ['png'],
            'name': 'PNG files'
        }]);
        if (!files) {
            return;
        }

        const filePath = files[0];
        const data = await uploadTextureFile(filePath);

        const itemData = await window.store.get('itemData');
        if (itemData.customTextures) {
            itemData.customTextures.push(data);
        } else {
            itemData.customTextures = [data];
        }

        itemData.itemComponentModels[componentId].texture = {
            id: data.id,
            name: data.fileName
        };

        await window.store.set('itemData', freeUnusedCustomTextures(itemData));
        await reloadComponentTextures();
        await previewCustomItem();
    }
}

function onDownloadTexture(componentId: string) {
    return async () => {
        const itemData = await window.store.get('itemData');
        const texture = itemData.itemComponentModels[componentId].texture;
        await downloadTextureFile(texture.id)
    }
}

function onColorizeTexture(idStr: string) {
    return async () => {
        const itemData = await window.store.get('itemData');
        $("#ci_hst_texture_id").val(itemData.itemComponentModels[idStr].texture.id);
        $("#ci_hst_hue").val(0);
        $("#ci_hst_saturation").val(1);
        $("#ci_hst_brightness").val(1);
        $("#ci_hst_lightness").val(0);
        await updateColorizePreview();
    }
}