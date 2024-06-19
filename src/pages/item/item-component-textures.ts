import { Modal } from "bootstrap"

import fallbackImg from "../../assets/unknown.webp"
import { notifyError } from "../../utils/alerts";
import { TextureFileData } from "../../models";

import { previewCustomItem } from "./preview-item";



export async function reloadComponentTextures() {
    const itemData = await window.store.get('itemData');

    $("#ci_componenttexture_file").val("");
    $("#ci_componenttexture_fileId").val("")
    $("#addComponentTextureBtn").attr('disabled', 'true');

    $("#component1TexturesSection .accordion-body").empty();
    $("#component2TexturesSection .accordion-body").empty();

    for (const idStr in itemData.itemComponentModels) {
        const data = itemData.itemComponentModels[idStr];
        const id = +idStr + 1;

        // Set Texture Content for Component
        if (data.texture.id > 0) {
            const formGroup = $("<div class='form-group mb-3' />");
            formGroup.append($("<label for='ci_componentModelTexture_" + id + "' class='form-label'>Texture File</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_componentModelTexture_" + id + "' class='form-control' readonly type='text' />");
            input.val(`${data.texture.id} - ${data.texture.name}`);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", onRemoveComponentTexture(idStr));
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);
            $("#component" + id + "TexturesSection .accordion-body").append(formGroup)
        } else {
            const button = $("<button id='component" + id + "AddTextureBtn' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addComponentTextureModal'>Add Texture</button>")
            button.on("click", function () {
                $("#ci_component_id").val(idStr);
                $("#ci_preview_page").val(0);
                $("#ci_componenttexture_file").val("");
                onSearchComponentTexture();
            })
            $("#component" + id + "TexturesSection .accordion-body").append(button)
        }
        const randomizeButton1 = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
        randomizeButton1.on("click", idStr === "0" ? onRandomizeComponent1Texture : onRandomizeComponent2Texture);
        $("#component" + id + "TexturesSection .accordion-body").append(randomizeButton1);
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

    const fromAndWhere = `
        FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
    `;
    const resp = await window.db.all<TextureFileData>(`
        SELECT *
        ${fromAndWhere}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}`,
        $("#ci_componenttexture_file").val()
    );
    if (resp.error) {
        throw resp.error;
    }

    const total = await window.db.get<{total: number}>(
        `SELECT COUNT(*) total ${fromAndWhere}`,
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
        linkElem.append(`<p>${texture.fileName}</p>`)
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
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchComponentTexture();
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
    let data: TextureFileData | null = null;
    while(!data) {
        const resp = await window.db.get(`
            SELECT r1.fileId, r1.fileName
            FROM texturefiles AS r1 
            JOIN (SELECT CEIL(?1 * (SELECT MAX(fileId) FROM texturefiles)) AS fileId) AS r2
            WHERE r1.fileId >= r2.fileId
            ORDER BY r1.fileId ASC
            LIMIT 1`, 
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
    }
   
    const itemData = await window.store.get('itemData');
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