
import { Modal, Tooltip } from "bootstrap"

import fallbackImg from "../../assets/unknown.webp"
import { notifyError } from "../../utils/alerts";
import { ItemMaterialData, TextureFileData } from "../../models";

import { previewCustomItem } from "./preview-item";
import { getClassName, getComponentSectionsForInventoryType, getRaceName } from "./wow-data-utils";


export async function reloadTextures() {
    const itemData = await window.store.get('itemData');

    const domTarget = "#texturesSection .accordion-body";
    $(`${domTarget} .btn`).each((_, elem) => {
        const tt = Tooltip.getInstance(elem);
        if (tt) { tt.dispose(); }
    })

    $(domTarget).empty();

    $("#ci_texture_textureFile").val("");
    $("#ci_texture_fileId").val("")
    $("#ci_texture_gender").val("3");
    $("#ci_texture_race").val("0");
    $("#ci_texture_class").val("0");
    $("#addTextureBtn").attr('disabled', 'true');
    $("#ci_texture_componentsection").empty();

    const sections = getComponentSectionsForInventoryType(itemData.inventoryType);

    if (sections.length === 0) {
        $("#texturesSection").parent().hide();
        return;
    }

    for (const section of sections) {
        $("#ci_texture_componentsection").append($("<option value='" + section + "'>" + window.WH.Wow.ComponentSections[section] + "</option>"))

        const formGroup = $("<div class='form-group mb-3' />");

        let label = window.WH.Wow.ComponentSections[section];
        formGroup.append($("<label for='ci_texture_" + section + "' class='form-label'>" + label + "</label>"));

        const input = $("<input id='ci_texture_" + section + "' class='form-control' readonly type='text' />");
        const textures = itemData.itemMaterials[section];
        if (textures && textures.length) {
            const texture = textures[0];
            input.val(`${texture.fileId} - ${texture.fileName}`);
        } else {
            input.val("None");
        }

        const inputGroup = $("<div class='input-group'/>");
        inputGroup.append(input);

        const editButton = $("<button class='btn btn-outline-dark'"
            + "data-bs-toggle='modal' data-bs-target='#addTextureModal'>"
            + "<i class='fa-solid fa-pencil'></i></button>");
        editButton.on("click", function () {
            $("#ci_preview_page").val(0);
            $("#ci_texture_textureFile").val("");
            $("#ci_texture_componentsection").val(section)
            onSearchTexture();
        })
        inputGroup.append(editButton);

        const randomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-shuffle'></i></button>");
        randomizeButton.on("click", onRandomizeTexture(section));
        inputGroup.append(randomizeButton);

        const removeButton = $("<button class='btn btn-outline-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on("click", onRemoveTexture(section));
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $(domTarget).append(formGroup);

        new Tooltip(editButton[0], { title: 'Edit' });
        new Tooltip(randomizeButton[0], { title: 'Randomize' });
        new Tooltip(removeButton[0], { title: 'Remove' })
    }

    $("#texturesSection").parent().show();
    const btnContainer = $("<div class='d-flex justify-content-between'>");

    const randomizeButton = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>")
    randomizeButton.on("click", onRandomizeTextures);
    btnContainer.append(randomizeButton);

    const removeButton = $("<button type='button' class='btn btn-outline-danger me-3'>Clear</button>")
    removeButton.on("click", onClearTextures);
    btnContainer.append(removeButton)

    $(domTarget).append(btnContainer);
}

function onRemoveTexture(section: number) {
    return async function () {
        const itemData = await window.store.get('itemData');
        itemData.itemMaterials[section] = [];
        await window.store.set('itemData', itemData);
        await reloadTextures();
        await previewCustomItem();
    }
}

async function onClearTextures() {
    const itemData = await window.store.get('itemData');
    itemData.itemMaterials = {};
    await window.store.set('itemData', itemData);
    await previewCustomItem();
    await reloadTextures();
}

async function onAddTexture(fileName: string, fileId: number) {
    const modelSupported = await testZamSupportTexture(fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the texture you selected isn't supported anymore, please select a new texture.")
        return;
    }

    const itemData = await window.store.get('itemData');

    const section = parseInt($("#ci_texture_componentsection").val().toString(), 10);
    const textureData = {
        fileName,
        fileId,
        gender: 3,
        race: 0,
        class: 0,
    };

    itemData.itemMaterials[section] = [textureData];
    await window.store.set('itemData', itemData);

    await reloadTextures();
    await previewCustomItem();
}

export async function onSearchTexture() {
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 4;

    const fromAndWhere = `
        FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        OR fileId IN (
            SELECT DITF.fileId
            FROM item_to_displayid IDI
            JOIN displayid_to_texturefile DITF ON DITF.displayId = IDI.itemDisplayId
            WHERE IDI.itemName LIKE '%' || ?1 || '%'
        )
    `;

    const resp = await window.db.all<TextureFileData>(`
        SELECT *
        ${fromAndWhere}
        ORDER BY fileId DESC
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}`,
        $("#ci_texture_textureFile").val()
    );
    if (resp.error) {
        throw resp.error;
    }

    const total = await window.db.get<{ total: number }>(
        `SELECT COUNT(*) total ${fromAndWhere}`,
        $("#ci_texture_textureFile").val()
    );

    $("#ci_texture_resultsPreview").empty();
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
            onAddTexture(texture.fileName, texture.fileId);
            Modal.getOrCreateInstance("#addTextureModal").hide();
        });
        col.append(linkElem);
        row.append(col);
    }
    $("#ci_texture_resultsPreview").append(row);
    const bottomContainer = $("<div class='d-flex justify-content-between align-items-center'>");
    const leftArrow = $("<button class='btn btn-light'><i class='fa-solid fa-arrow-left'></i></button>")
    if (page === 0) {
        leftArrow.attr('disabled', 'disabled');
    } else {
        leftArrow.on('click', prevPage);
    }
    const rightArrow = $("<button class='btn btn-light'><i class='fa-solid fa-arrow-right'></i></button>")
    if (page === Math.ceil(total.result.total / pageSize) - 1) {
        rightArrow.attr('disabled', 'disabled');
    } else {
        rightArrow.on('click', nextPage)
    }
    bottomContainer.append(leftArrow);
    bottomContainer.append(`<p class="text-center mb-0">Showing results ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, total.result.total)} out of ${total.result.total}</p>`);
    bottomContainer.append(rightArrow);
    $("#ci_texture_resultsPreview").append(bottomContainer);
}

function nextPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage + 1);
    onSearchTexture();
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchTexture();
}

export async function onRandomizeTextures() {
    $.LoadingOverlay("show");

    await randomizeTextures();
    await previewCustomItem();
    await reloadTextures();
    $.LoadingOverlay("hide");
}

export async function randomizeTextures() {
    const itemData = await window.store.get('itemData');
    const sections = getComponentSectionsForInventoryType(itemData.inventoryType);

    for (const section of sections) {
        const texture = await getRandomTexture();
        itemData.itemMaterials[section] = [{
            fileName: texture.fileName,
            fileId: texture.fileId,
            gender: 3,
            race: 0,
            class: 0
        }]
    }
    await window.store.set('itemData', itemData);
}

function onRandomizeTexture(section: number) {
    return async () => {
        $.LoadingOverlay('show');
        const itemData = await window.store.get('itemData');
        const texture = await getRandomTexture();
        itemData.itemMaterials[section] = [{
            fileName: texture.fileName,
            fileId: texture.fileId,
            gender: 3,
            race: 0,
            class: 0
        }]
        await window.store.set('itemData', itemData);
        await previewCustomItem();
        await reloadTextures();
        $.LoadingOverlay("hide");
    }
}

async function getRandomTexture() {
    let data: TextureFileData | null = null;
    while (!data) {
        const resp = await window.db.get(`
            SELECT *
            FROM texturefiles
            WHERE ROWID =  CEIL(?1 * (SELECT MAX(ROWID) FROM modelresources))
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
    return data;
}

async function testZamSupportTexture(fileId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${fileId}.webp`
    const resp = await fetch(uri);
    return resp.ok;
}