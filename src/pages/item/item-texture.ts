
import { Modal, Tooltip } from "bootstrap"

import fallbackImg from "../../assets/unknown.webp"
import { notifyError } from "../../utils/alerts";
import { TextureFileData } from "../../models";

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

    const sections = getComponentSectionsForInventoryType(itemData.inventoryType);
    if (sections.length === 0) {
        $(domTarget).closest('.accordion-item').hide();
        return;
    }

    $("#ci_texture_textureFile").val("");
    $("#ci_texture_fileId").val("")
    $("#ci_texture_gender").val("3");
    $("#ci_texture_race").val("0");
    $("#ci_texture_class").val("0");
    $("#addTextureBtn").attr('disabled', 'true');
    $("#ci_texture_componentsection").empty();


    $(domTarget).closest('.accordion-item').show();

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
            $("#ci_texture_onlyForIs").prop('checked', false);
            $("#ci_texture_onlyForSect").prop('checked', false);
            onSearchTexture();
        })
        inputGroup.append(editButton);

        const softRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-shuffle'></i></button>");
        softRandomizeButton.on("click", onRandomizeTexture(section));
        inputGroup.append(softRandomizeButton);

        const hardRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-dice'></i></button>");
        hardRandomizeButton.on("click", onHardRandomizeTexture(section));
        inputGroup.append(hardRandomizeButton);

        const removeButton = $("<button class='btn btn-outline-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on("click", onRemoveTexture(section));
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $(domTarget).append(formGroup);

        new Tooltip(editButton[0], { title: 'Edit' });
        new Tooltip(softRandomizeButton[0], { title: 'Soft Randomize' });
        new Tooltip(hardRandomizeButton[0], { title: 'Hard Randomize' });
        new Tooltip(removeButton[0], { title: 'Remove' })

        if (textures && textures.length) {
            const tooltipLink = $(`<a class='link-underline-primary'>${textures.length} race/gender/class variation(s)</a>`);

            let tooltipText = "";
            for(const texture of textures) {
                let label = "";
                if (texture.race !== 0) {
                    label = getRaceName(texture.race);
                } else {
                    label = "All Races";
                }
                let genderLabel = "Male & Female"
                if (texture.gender !== 3) {
                    genderLabel = (texture.gender === 0 ? "Male" : "Female")
                }
                label += " - " + genderLabel;
                if (texture.class != 0) {
                    tooltipText += " - " + getClassName(texture.class);
                }
                tooltipText += label + "</br>";
            }

            const tooltipP = $("<p>Texture has </p>");
            tooltipP.append(tooltipLink);
            $(domTarget).append(tooltipP)
            new Tooltip(tooltipLink[0], { title: tooltipText, html: true });
        }
    }

    const btnContainer = $("<div class='d-flex justify-content-between'>");

    const softRandomizeButton = $("<button type='button' class='btn btn-dark me-3'>Soft Randomize</button>")
    softRandomizeButton.on("click", onRandomizeTextures);
    btnContainer.append(softRandomizeButton);

    const hardRandomizeButton = $("<button type='button' class='btn btn-warning me-3'>Hard Randomize</button>")
    hardRandomizeButton.on("click", onHardRandomizeTextures);
    btnContainer.append(hardRandomizeButton);

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

async function onAddTexture(materialResourceId: number ) {
    const itemData = await window.store.get('itemData');
    const dbResp = await window.db.all<TextureFileData>(
        `SELECT * FROM texturefiles where materialResourceId = ?`,
        materialResourceId
    )
    if (dbResp.error) {
        throw dbResp.error;
    }

    const modelSupported = await testZamSupportTexture(dbResp.result[0].fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the texture you selected isn't supported anymore, please select a new texture.")
        return;
    }

    const section = parseInt($("#ci_texture_componentsection").val().toString(), 10);
    const textureData = dbResp.result.map((item) => ({
        fileName: item.fileName,
        fileId: item.fileId,
        gender: item.genderId,
        race: item.raceId,
        class: item.classId,
    }));

    itemData.itemMaterials[section] = textureData;
    await window.store.set('itemData', itemData);

    await reloadTextures();
    await previewCustomItem();
}

export async function onSearchTexture() {
    const itemData = await window.store.get('itemData');
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 4;
    const onlyAppropriate = $("#ci_texture_onlyForIs").is(':checked');
    const onlyForSect = $("#ci_texture_onlyForSect").is(':checked');

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
        )
    `;    
    if (onlyAppropriate) {
        fromAndWhere += `               
            AND MI.fileId IN (
                SELECT DITF.fileId
                FROM item_to_displayid IDI
                JOIN displayid_to_texturefile DITF ON IDI.itemDisplayId = DITF.displayId
                WHERE IDI.inventoryType ${
                    itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_CHEST ?
                        "IN (4,5,20)" : "= " + itemData.inventoryType 
                }
            )`
    }
    if (onlyForSect) {
        const section = parseInt($("#ci_texture_componentsection").val().toString());
        fromAndWhere += `
            AND MI.fileId IN (
                SELECT fileID
                FROM componentsection_to_texturefile CTF
                WHERE CTF.componentSection = ${section}
            )
        `
    }

    const resp = await window.db.all<TextureFileData>(`
        ${ctes}
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
        `${ctes} SELECT COUNT(*) total ${fromAndWhere}`,
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
            onAddTexture(texture.materialResourceId);
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
    $(this).parent().find("button").attr('disabled', 'disabled');
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchTexture();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

async function onRandomizeTextures() {
    $.LoadingOverlay("show");

    await randomizeTextures();
    await previewCustomItem();
    await reloadTextures();
    $.LoadingOverlay("hide");
}

async function onHardRandomizeTextures() {
    $.LoadingOverlay("show");
    await hardRandomizeTextures();
    await previewCustomItem();
    await reloadTextures();
    $.LoadingOverlay("hide");
}

export async function randomizeTextures() {
    const itemData = await window.store.get('itemData');
    const sections = getComponentSectionsForInventoryType(itemData.inventoryType);

    for (const section of sections) {
        const textures = await getRandomTextures(section);
        itemData.itemMaterials[section] = textures.map((item) => ({
            fileName: item.fileName,
            fileId: item.fileId,
            gender: item.genderId,
            race: item.raceId,
            class: item.classId,
        }));
    }
    await window.store.set('itemData', itemData);
}

async function hardRandomizeTextures() {
    const itemData = await window.store.get('itemData');
    const sections = getComponentSectionsForInventoryType(itemData.inventoryType);

    for (const section of sections) {
        const textures = await getCompletelyRandomTextures();
        itemData.itemMaterials[section] = textures.map((item) => ({
            fileName: item.fileName,
            fileId: item.fileId,
            gender: item.genderId,
            race: item.raceId,
            class: item.classId,
        }));
    }
    await window.store.set('itemData', itemData);
}

function onRandomizeTexture(section: number) {
    return async () => {
        $.LoadingOverlay('show');
        const itemData = await window.store.get('itemData');
        const textures = await getRandomTextures(section);
        itemData.itemMaterials[section] = textures.map((item) => ({
            fileName: item.fileName,
            fileId: item.fileId,
            gender: item.genderId,
            race: item.raceId,
            class: item.classId,
        }));
        await window.store.set('itemData', itemData);
        await previewCustomItem();
        await reloadTextures();
        $.LoadingOverlay("hide");
    }
}

function onHardRandomizeTexture(section: number) {
    return async () => {
        $.LoadingOverlay('show');
        const itemData = await window.store.get('itemData');
        const textures = await getCompletelyRandomTextures();
        itemData.itemMaterials[section] = textures.map((item) => ({
            fileName: item.fileName,
            fileId: item.fileId,
            gender: item.genderId,
            race: item.raceId,
            class: item.classId,
        }));
        await window.store.set('itemData', itemData);
        await previewCustomItem();
        await reloadTextures();
        $.LoadingOverlay("hide");
    }
}

async function getRandomTextures(section: number) {
    const itemData = await window.store.get('itemData');
    let data: TextureFileData[] | null = null;
    while (!data) {
        const resp = await window.db.all<TextureFileData>(`
            WITH mrIds as (
                SELECT DISTINCT materialResourceId
                FROM texturefiles
                WHERE fileId IN (
                    SELECT DITF.fileId
                    FROM item_to_displayid IDI
                    JOIN displayid_to_texturefile DITF ON DITF.displayId = IDI.itemDisplayId
                    WHERE IDI.inventoryType ${
                        itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_CHEST ?
                            "IN (4,5,20)" : "= " + itemData.inventoryType 
                    }
                )
                AND fileId IN (
                    SELECT fileID
                    FROM componentsection_to_texturefile CTF
                    WHERE CTF.componentSection = ${section}
                )
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
        data = resp.result;
        const supported = await testZamSupportTexture(data[0].fileId);
        if (!supported) {
            data = null;
        }
    }
    return data;
}

async function getCompletelyRandomTextures() {
    let data: TextureFileData[] | null = null;
    while (!data) {
        const resp = await window.db.all<TextureFileData>(`
            WITH mrIds as (
                SELECT DISTINCT materialResourceId
                FROM texturefiles
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
        data = resp.result;
        const supported = await testZamSupportTexture(data[0].fileId);
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