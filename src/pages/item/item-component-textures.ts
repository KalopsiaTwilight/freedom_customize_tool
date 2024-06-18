import { notifyError } from "../../utils";
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
            input.val(data.texture.name);
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

export async function onAddComponentTexture() {
    const fileId = parseInt($("#ci_componenttexture_fileId").val().toString(), 10);
    const modelSupported = await testZamSupportTexture(fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the texture you selected isn't supported anymore, please select a new texture.")
        return;
    }

    const itemData = await window.store.get('itemData');
    const componentId = $("#ci_component_id").val().toString();
    const textureData = {
        name: $("#ci_componenttexture_file").val().toString(),
        id: parseInt($("#ci_componenttexture_fileId").val().toString(), 10)
    };
    itemData.itemComponentModels[componentId].texture = textureData;
    await window.store.set('itemData', itemData);
    await reloadComponentTextures();
    await previewCustomItem();
}

export async function onSearchComponentTexture() {
    const resp = await window.db.all(`
        SELECT * FROM texturefiles 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`,
        $("#ci_componenttexture_file").val()
    );
    if (resp.error) {
        throw resp.error;
    }
    const data = resp.result as TextureFileData[];
    $("#ci_componenttexture_searchResults").empty();
    for (const texture of data) {
        const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
        itemElem.text(texture.fileName);
        itemElem.on("click", function () {
            $("#ci_componenttexture_file").val(texture.fileName);
            $("#ci_componenttexture_fileId").val(texture.fileId);
            $("#ci_componenttexture_searchResults").empty();
            $("#addComponentTextureBtn").removeAttr('disabled');
        });
        const li = $("<li>");
        li.append(itemElem);
        $("#ci_componenttexture_searchResults").append(li);
    }
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