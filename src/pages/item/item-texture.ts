
import { Modal, Tooltip } from "bootstrap"

import { notifyError } from "../../utils/alerts";
import { TextureFileData, ItemComponentSection, InventoryType, ItemFileData } from "../../models";
import { componentSectionToName } from "../../utils";

import { previewCustomItem } from "./preview-item";
import { getClassName, getComponentSectionsForInventoryType, getRaceName } from "./wow-data-utils";
import { fallbackImg } from "./consts";
import { downloadTextureFile, freeUnusedCustomTextures, isCustomTexture, uploadTextureFile } from "./shared";

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


    $(domTarget).closest('.accordion-item').show();

    for (const section of sections) {
        const formGroup = $("<div class='form-group mb-3' />");

        let label = componentSectionToName(section);
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

        const editButton = $("<button class='btn btn-outline-primary'"
            + "data-bs-toggle='modal' data-bs-target='#addTextureModal'>"
            + "<i class='fa-solid fa-pencil'></i></button>");
        editButton.on("click", function () {
            $("#ci_preview_page").val(0);
            $("#ci_texture_textureFile").val("");
            $("#ci_texture_componentsectionFilter").val(-1)
            $("#ci_texture_componentsection").val(section);
            $("#ci_texture_onlyForIs").prop('checked', false);
            onSearchTexture();
        })
        inputGroup.append(editButton);

        const uploadTextureButton = $("<button class='btn btn-outline-secondary'"
            + "data-bs-toggle='modal' data-bs-target='#addCustomTextureModal'>"
            + "<i class='fa-solid fa-upload'></i></button>");
        uploadTextureButton.on("click", onUploadTexture(section));
        inputGroup.append(uploadTextureButton);

        const downloadTextureButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-download'></i></button>");
        downloadTextureButton.on("click", onDownloadTexture(section));
        inputGroup.append(downloadTextureButton);

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
        new Tooltip(uploadTextureButton[0], { title: 'Upload Texture'});
        new Tooltip(downloadTextureButton[0], { title: 'Download Texture'});
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

    const softRandomizeButton = $("<button type='button' class='btn btn-primary me-3'>Soft Randomize</button>")
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

function onRemoveTexture(section: ItemComponentSection) {
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
        )
    `;    
    const inventoryTypeFilter = parseInt($("#ci_texture_inventorySlotFilter").val().toString(), 10);
    if (inventoryTypeFilter >= 0) {
        fromAndWhere += `               
            AND MI.fileId IN (
                SELECT DITF.fileId
                FROM item_to_displayid IDI
                JOIN displayid_to_texturefile DITF ON IDI.itemDisplayId = DITF.displayId
                WHERE IDI.inventoryType = ${inventoryTypeFilter}
            )`
    }
    const sectionFilter = parseInt($("#ci_texture_componentsectionFilter").val().toString());
    if (sectionFilter >= 0) {
        fromAndWhere += `
            AND MI.fileId IN (
                SELECT fileID
                FROM componentsection_to_texturefile CTF
                WHERE CTF.componentSection = ${sectionFilter}
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
        linkElem.append(`<p class="text-truncate" style="max-width: 90%">${texture.fileName}</p>`)
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
        if (!textures.length) {
            notifyError("Unable to get a random texture! Please report this to a developer!");
            return;
        }
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
        if (!textures.length) {
            notifyError("Unable to get a random texture! Please report this to a developer!");
            return;
        }
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

function onRandomizeTexture(section: ItemComponentSection) {
    return async () => {
        $.LoadingOverlay('show');
        const itemData = await window.store.get('itemData');
        const textures = await getRandomTextures(section);
        if (!textures.length) {
            notifyError("Unable to get a random texture! Please report this to a developer!");
        } else {
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
        }
        $.LoadingOverlay("hide");
    }
}

function onHardRandomizeTexture(section: ItemComponentSection) {
    return async () => {
        $.LoadingOverlay('show');
        const itemData = await window.store.get('itemData');
        const textures = await getCompletelyRandomTextures();
        if (!textures.length) {
            notifyError("Unable to get a random texture! Please report this to a developer!");
        } else {
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
        }
        $.LoadingOverlay("hide");
    }
}

async function getRandomTextures(section: ItemComponentSection): Promise<TextureFileData[] | null> {
    const itemData = await window.store.get('itemData');
    let data: TextureFileData[] | null = null;

    const maxTries = 10;
    let nrTries = 0;
    while ((!data || !data.length) && nrTries < maxTries) {
        const resp = await window.db.all<TextureFileData>(`
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
                ${ itemData.inventoryType === InventoryType.Back ? '' : `AND fileId IN (
                    SELECT fileID
                    FROM componentsection_to_texturefile CTF
                    WHERE CTF.componentSection = ${section}
                    )`
                }

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
        if (data.length > 0) {
            const supported = await testZamSupportTexture(data[0].fileId);
            if (!supported) {
                data = null;
            }
        }
        nrTries++;
    }
    return data;
}

async function getCompletelyRandomTextures(): Promise<TextureFileData[] | null> {
    let data: TextureFileData[] | null = null;

    const maxTries = 10;
    let nrTries = 0;
    while (!data.length && nrTries < maxTries) {
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
        nrTries++;
    }
    return data;
}

async function testZamSupportTexture(fileId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${fileId}.webp`
    const resp = await fetch(uri);
    return resp.ok;
}

export async function onSubmitSectionTextureUpload() {
    const section = parseInt($("#ci_ctexture_for").val().toString().split("_").pop())
    const filePath = $("#ci_ctexture_file").val().toString();
    const race = parseInt($("#ci_ctexture_race").val().toString());
    const gender = parseInt($("#ci_ctexture_gender").val().toString());
    const classId = parseInt($("#ci_ctexture_class").val().toString());
    const data = await uploadTextureFile(filePath, gender, race, classId);
    
    const itemData = await window.store.get('itemData');
    if (itemData.customTextures) {
        itemData.customTextures.push(data);
    } else {
        itemData.customTextures = [data];
    }
    const usesCustomTextures = itemData.itemMaterials[section].every(x => isCustomTexture(x.fileId))

    const fileData: ItemFileData = {
        class: data.class,
        fileId: data.id,
        fileName: data.fileName,
        gender: data.gender,
        race: data.race
    };

    if (usesCustomTextures) {
        itemData.itemMaterials[section] = itemData.itemMaterials[section].filter(
            x => (data.class === 0 ? false : x.class !== 0) || x.gender !== data.gender || x.race !== data.race
        )
        itemData.itemMaterials[section] = itemData.itemMaterials[section].filter(
            x => (data.gender === 3 ? false : x.gender !== 3) || x.class !== data.class || x.race !== data.race
        )
        itemData.itemMaterials[section] = itemData.itemMaterials[section].filter(
            x => (data.race === 0 ? false : x.race !== 0) || x.class !== data.class || x.gender !== data.gender
        )
        itemData.itemMaterials[section].push(fileData)
    } else {
        itemData.itemMaterials[section] = [fileData];
    }

    await window.store.set('itemData', freeUnusedCustomTextures(itemData));
    await reloadTextures();
    await previewCustomItem();
}

function onUploadTexture(section: number) {
    return () => {
        $("#ci_ctexture_for").val("section_" + section);
        $("#uploadCustomTextureBtn").attr('disabled', 'disabled');
        $("#ci_ctexture_file").val();
        $("#ci_ctexture_class").val(0);
        $("#ci_ctexture_gender").val(3);
        $("#ci_ctexture_race").val(0);
    }
}

function onDownloadTexture(section: number) {
    return async () => {
        const itemData = await window.store.get('itemData');
        for(const textureData of itemData.itemMaterials[section])
        {
            await downloadTextureFile(textureData.fileId)
        }
    }
}