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
            input.val(texture.fileName);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", onRemoveTexture(section, texture));
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);
            $("#texturesSection .accordion-body").append(formGroup);
        }
    }

    if (opts.length > 0) {
        $("#texturesSection .accordion-body")
            .append($("<button type='button' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addTextureModal'>Add Textures</button>"));
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

export async function onAddTexture() {
    const itemData = await window.store.get('itemData');

    const section = parseInt($("#ci_texture_componentsection").val().toString(), 10);
    const textureData = {
        fileName: $("#ci_texture_textureFile").val().toString(),
        fileId: parseInt($("#ci_texture_fileId").val().toString(), 10),
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
    const resp = await window.db.all(`
        SELECT * FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_texture_textureFile").val()
    );
    if (resp.error) {
        throw resp.error;
    }
    const data = resp.result as TextureFileData[];
    $("#ci_texture_textureResults").empty();
    for (const texture of data) {
        const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
        itemElem.text(texture.fileName);
        itemElem.on("click", function () {
            $("#ci_texture_textureFile").val(texture.fileName);
            $("#ci_texture_fileId").val(texture.fileId);
            $("#ci_texture_textureResults").empty();
            $("#addTextureBtn").removeAttr('disabled');
        });
        const li = $("<li>");
        li.append(itemElem);
        $("#ci_texture_textureResults").append(li);
    }
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
        const data = resp.result as TextureFileData;
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

