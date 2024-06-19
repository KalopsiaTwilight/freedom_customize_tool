
import { Modal } from "bootstrap"

import fallbackImg from "../../assets/unknown.webp"
import { notifyError } from "../../utils/alerts";
import { ItemMaterialData, TextureFileData } from "../../models";

import { previewCustomItem } from "./preview-item";
import { getClassName, getComponentSectionsForInventoryType, getRaceName } from "./wow-data-utils";


export async function reloadTextures() {
    const itemData = await window.store.get('itemData');

    $("#ci_texture_componentsection").empty();

    let opts = getComponentSectionsForInventoryType(itemData.inventoryType);
    // opts = opts.filter((x) => textures.findIndex((y) => y.section === x) === -1);
    for (const opt of opts) {
        $("#ci_texture_componentsection").append($("<option value='" + opt + "'>" + window.WH.Wow.ComponentSections[opt] + "</option>"))
    }

    $("#ci_texture_textureFile").val("");
    $("#ci_texture_fileId").val("")
    $("#ci_texture_gender").val("3");
    $("#ci_texture_race").val("0");
    $("#ci_texture_class").val("0");
    $("#addTextureBtn").attr('disabled', 'true');

    $("#texturesSection .accordion-body").empty();

    for (const sectionStr in itemData.itemMaterials) {
        const textures = itemData.itemMaterials[sectionStr];
        const section = parseInt(sectionStr, 10);
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            const formGroup = $("<div class='form-group mb-3' />");
            let label = window.WH.Wow.ComponentSections[section];
            if (texture.gender !== 3) {
                label += " - " + (texture.gender === 0 ? "Male" : "Female")
            }
            if (texture.race !== 0) {
                label += " - " + getRaceName(texture.race);
            }
            if (texture.class !== 0) {
                label += " - " + getClassName(texture.class);
            }
            formGroup.append($("<label for='ci_texture_" + section + "_" + i + "' class='form-label'>" + label + "</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_texture_" + section + "_" + i + "' class='form-control' readonly type='text' />");
            input.val(`${texture.fileId} - ${texture.fileName}`);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", onRemoveTexture(section, texture));
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);
            $("#texturesSection .accordion-body").append(formGroup);
        }
    }

    if (opts.length > 0) {
        const addTextureBtn = $("<button type='button' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addTextureModal'>Add Textures</button>");
        
        addTextureBtn.on('click', () => {
            $("#ci_preview_page").val(0);
            $("#ci_texture_textureFile").val("");
            onSearchTexture();
        })
        $("#texturesSection .accordion-body").append(addTextureBtn);
        const randomizeButton = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>")
        randomizeButton.on("click", onRandomizeTextures);
        $("#texturesSection .accordion-body")
            .append(randomizeButton);

    } else {
        $("#texturesSection .accordion-body")
            .append($("<p class='text-muted'>Textured geosets are unavailable for this inventory type. Please use components instead.</p>"));
    }
}

function onRemoveTexture(section: number, texture: ItemMaterialData) {
    return async function () {
        const itemData = await window.store.get('itemData');
        itemData.itemMaterials[section].splice(itemData.itemMaterials[section].indexOf(texture), 1);
        await window.store.set('itemData', itemData);
        await reloadTextures();
        await previewCustomItem();
    }
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
    if (itemData.itemMaterials[section]) {
        itemData.itemMaterials[section].push(textureData);
    } else {
        itemData.itemMaterials[section] = [textureData];
    }
    await window.store.set('itemData', itemData);
    
    await reloadTextures();
    await previewCustomItem();
}

export async function onSearchTexture() {
    $.LoadingOverlay("show");
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

    const total = await window.db.get<{total: number}>(
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
    if (page === Math.ceil(total.result.total/pageSize)-1) {
        rightArrow.attr('disabled', 'disabled');
    } else {
        rightArrow.on('click', nextPage)
    }
    bottomContainer.append(leftArrow);
    bottomContainer.append(`<p class="text-center mb-0">Showing results ${page * pageSize + 1}-${Math.min((page+1) * pageSize, total.result.total)} out of ${total.result.total}</p>`);
    bottomContainer.append(rightArrow);
    $("#ci_texture_resultsPreview").append(bottomContainer);

    $.LoadingOverlay("hide");
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
        itemData.itemMaterials[section] = [{
            fileName: data.fileName,
            fileId: data.fileId,
            gender: 3,
            race: 0,
            class: 0
        }]
    }
    await window.store.set('itemData', itemData);
}

async function testZamSupportTexture(fileId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${fileId}.webp`
    const resp = await fetch(uri);
    return resp.ok;
}