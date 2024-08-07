import { ModelResourceData, InventoryType, ExtendedModelResourceData } from "../../models";
import { notifyError } from "../../utils/alerts";
import { fallbackImg } from "./consts";
import { previewCustomItem } from "./preview-item";
import { 
    componentSlotSupportedForInventoryType, getRaceName, getWowHeadThumbForDisplayId, noComponentSupportedInventoryTypes 
} from "./wow-data-utils";

import { Modal, Tooltip } from "bootstrap"

export async function reloadComponentModels() {
    const itemData = await window.store.get('itemData');

    $("#ci_componentmodel_modelfile").val("");
    $("#ci_componentmodel_fileId").val("")
    $("#ci_componentmodel_gender").val("3");
    $("#ci_componentmodel_race").val("0");
    $("#ci_componentmodel_class").val("0");
    $("#addComponentModelBtn").attr('disabled', 'true');

    const domTargets = {
        "0": "#component1ModelsSection",
        "1": "#component2ModelsSection"
    } as { [key:string]: string }

    for(const id in domTargets) {
        $(`${domTargets[id]} .btn`).each((_, elem) => {
            const tt = Tooltip.getInstance(elem);
            if (tt) { tt.dispose(); }
        })
    }

    $(domTargets["0"]).empty()
    $(domTargets["1"]).empty()

    if (noComponentSupportedInventoryTypes.indexOf(itemData.inventoryType) !== -1) {
        $(domTargets["0"]).closest('.accordion-item').hide();
        $(domTargets["1"]).closest('.accordion-item').hide();
        return;
    }
    else if (itemData.inventoryType === InventoryType.Shoulders) {
        $("#component1Title").text("Left Shoulder Pad");
        $("#component2Title").text("Right Shoulder Pad");
        $(domTargets["0"]).closest('.accordion-item').show();
        $(domTargets["1"]).closest('.accordion-item').show();
    } 
    else if (itemData.inventoryType === InventoryType.Back) {
        $("#component1Title").text("<Component Not Available for Capes>");
        $("#component2Title").text("Component 1");
        $(domTargets["0"]).closest('.accordion-item').hide();
        $(domTargets["1"]).closest('.accordion-item').show();
    }
    else {
        $("#component1Title").text("Component 1");
        $("#component2Title").text("Component 2");
        $(domTargets["0"]).closest('.accordion-item').show();
        $(domTargets["1"]).closest('.accordion-item').show();
    }


    for (const idStr in itemData.itemComponentModels) {
        const data = itemData.itemComponentModels[idStr];
        const id = +idStr + 1;
        
        const input = $("<input id='ci_componentModel" + id +"' class='form-control' readonly type='text' />");
        if (data.models.length > 0) {
            input.val(`${data.models[0].fileId} - ${data.models[0].fileName}`);
        } else {
            input.val("None");
        }

        const inputGroup = $("<div class='input-group'/>");
        inputGroup.append(input);

        const editButton = $("<button type='button' class='btn btn-outline-primary'" 
            + "data-bs-toggle='modal' data-bs-target='#addComponentModelModal'>" 
            + "<i class='fa-solid fa-pencil'></i></button>"
        );
        editButton.on("click", function () {
            $("#ci_component_id").val(idStr);
            $("#ci_componentmodel_modelfile").val("");
            $("#ci_preview_page").val(0);
            $("#ci_componentmodel_onlyForIs").prop('checked', false);
            onSearchComponentModel();
        });
        inputGroup.append(editButton)

        const softRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-shuffle'></i></button>");
        softRandomizeButton.on("click", async () => {
            $.LoadingOverlay("show");
            await randomizeComponentModel(idStr);
            await reloadComponentModels();
            await previewCustomItem();
            $.LoadingOverlay("hide");
        });
        inputGroup.append(softRandomizeButton);

        const hardRandomizeButton = $("<button class='btn btn-outline-secondary'><i class='fa-solid fa-dice'></i></button>");
        hardRandomizeButton.on("click", async () => {
            $.LoadingOverlay("show");
            await hardRandomizeComponentModel(idStr);
            await reloadComponentModels();
            await previewCustomItem();
            $.LoadingOverlay("hide");
        });
        inputGroup.append(hardRandomizeButton);

        const removeButton = $("<button class='btn btn-outline-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on("click", onRemoveComponentModel(idStr));
        inputGroup.append(removeButton)

        const formGroup = $("<div class='form-group mb-3' />");
        formGroup.append(inputGroup);
        $(domTargets[idStr]).append(formGroup)

        new Tooltip(editButton[0], { title: 'Edit' });
        new Tooltip(softRandomizeButton[0], { title: 'Soft Randomize' });
        new Tooltip(hardRandomizeButton[0], { title: 'Hard Randomize' });
        new Tooltip(removeButton[0], { title: 'Remove'})

        if (data.models.length) {
            const tooltipLink = $(`<a class='link-underline-primary'>${data.models.length} race/gender combinations</a>`);

            let tooltipText = "";
            const racesProcessed: number[] = [];
            for(const model of data.models) {
                let label = "";
                if (model.race !== 0) {
                    label = getRaceName(model.race);
                } else {
                    label = "All Races";
                }
                let genderLabel = "Male & Female"
                if (model.gender < 2) {
                    if (racesProcessed.indexOf(model.race) !== -1) {
                        continue;
                    }
                    if (data.models.findIndex((i) => i.race === model.race && i.gender !== model.gender) !== -1) {
                        racesProcessed.push(model.race);
                    } else {
                        genderLabel = (model.gender === 0 ? "Male" : "Female")
                    }
                }
                label += " - " + genderLabel;
                if (model.extraData !== -1) {
                    label += " - " + (model.extraData === 0 ? "Left Shoulderpad" : "Right Shoulderpad")
                }
                tooltipText += label + "</br>";
            }

            const tooltipP = $("<p>Model is available for </p>");
            tooltipP.append(tooltipLink);
            $(domTargets[idStr]).append(tooltipP)
            new Tooltip(tooltipLink[0], { title: tooltipText, html: true });
        }
    }
}

function onRemoveComponentModel(idStr: string) {
    return async function () {
        const itemData = await window.store.get('itemData');
        itemData.itemComponentModels[idStr].models = [];
        await window.store.set('itemData', itemData);
        await reloadComponentModels();
        await previewCustomItem();
    }
}

async function onAddComponentModel(modelResourceId: number) {
    const itemData = await window.store.get('itemData');
    const dbResp = await window.db.all<ModelResourceData>(
        `SELECT * FROM modelresources where modelResourceId = ?`,
        modelResourceId
    )
    if (dbResp.error) {
        throw dbResp.error;
    }

    const modelSupported = await testZamSupportComponentModel(dbResp.result[0].fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the component model you selected isn't supported anymore, please select a new model.")
        return;
    }
    
    const componentId = $("#ci_component_id").val().toString();
    itemData.itemComponentModels[componentId].models = dbResp.result.map((model) => ({
            fileName: model.fileName,
            fileId: model.fileId,
            gender: model.genderId,
            race: model.raceId,
            class: 0,
            extraData: model.extraData
    }));
   
    await window.store.set('itemData', itemData);
    await reloadComponentModels();
    await previewCustomItem();
}

export async function onSearchComponentModel() {
    const page = parseInt($("#ci_preview_page").val().toString());

    const pageSize = 4;
    const ctes = `
        WITH matchingItems AS
        (
            SELECT MR1.*, DIMR.displayId
            FROM modelresources MR1
            JOIN displayid_to_modelresource DIMR ON DIMR.displayId = (SELECT MIN(displayId) FROM displayid_to_modelresource WHERE modelResourceId = MR1.modelResourceId)
            WHERE 
            (
                MR1.fileName like '%'|| ?1 || '%' 
                OR MR1.fileId LIKE '%' || ?1 || '%'
                OR DIMR.displayId IN (
                    SELECT IDI.itemDisplayId
                    FROM item_to_displayid IDI
                    WHERE IDI.itemName LIKE '%' || ?1 || '%'
                )
            )
        )
    `
    let fromAndFilterQuery = `
        FROM matchingItems MI
        WHERE MI.fileId IN (
            SELECT MIN(fileId)
            FROM matchingItems MI2
            GROUP BY MI2.modelResourceId
        )
    `;
    const inventoryTypeFilter = parseInt($("#ci_componentmodel_inventorySlotFilter").val().toString(), 10);
    if (inventoryTypeFilter >= 0) {
        fromAndFilterQuery += `               
            AND MI.displayId IN (
                SELECT itemDisplayId 
                FROM item_to_displayid
                WHERE inventoryType = ${inventoryTypeFilter}
            )`
    }
    const resp = await window.db.all<ExtendedModelResourceData>(`
        ${ctes}
        SELECT * 
        ${fromAndFilterQuery}
        ORDER BY fileId DESC
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
        `, 
        $("#ci_componentmodel_modelfile").val()
    )
    if (resp.error) {
        throw resp.error;
    }
    const total = await window.db.get<{total: number}>(
        `${ctes} SELECT COUNT(*) total ${fromAndFilterQuery}`,
        $("#ci_componentmodel_modelfile").val()
    );

    $("#ci_componentmodel_resultsPreview").empty();
    const row = $("<div class='row'>");
    for (const item of resp.result) {
        const col = $("<div class='col-6 mb-3'>");
        const linkElem = $("<a role='button' class='d-flex flex-column align-items-center border'>");
        const imgUri = getWowHeadThumbForDisplayId(item.displayId);
        const img = $(`<img src="${imgUri}" width=200 height=200 />`);
        linkElem.append(img);
        img.on('error', function () {
            $(this).attr('src', fallbackImg);
        })
        linkElem.append(`<p class="text-truncate" style="max-width: 90%">${item.fileName}</p>`)
        linkElem.on("click", function () {
            onAddComponentModel(item.modelResourceId);
            Modal.getOrCreateInstance("#addComponentModelModal").hide();
        });
        col.append(linkElem);
        row.append(col);
    }
    $("#ci_componentmodel_resultsPreview").append(row);
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
    $("#ci_componentmodel_resultsPreview").append(bottomContainer);
}

function nextPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage + 1);
    onSearchComponentModel();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchComponentModel();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

export async function randomizeComponentModel(slot: string) {
    const itemData = await window.store.get('itemData');
    let data: ModelResourceData[]  =[];
    const maxTries = 10;
    let nrTries = 0;
    while (!data.length && nrTries < maxTries) {
        const resp = await window.db.all<ModelResourceData>(`
            WITH mrIds as (
                SELECT DISTINCT MR.modelResourceId
                FROM modelresources MR
                JOIN displayid_to_modelresource DIMR ON DIMR.displayId = (SELECT MIN(displayId) FROM displayid_to_modelresource WHERE modelResourceId = MR.modelResourceId)
                WHERE DIMR.displayId IN (
                    SELECT itemDisplayId 
                    FROM item_to_displayid
                    WHERE inventoryType ${
                        itemData.inventoryType === InventoryType.Chest ?
                            "IN (4,5,20)" : 
                        itemData.inventoryType === InventoryType.OneHand ? 
                            "IN (13, 21, 22)" : "= " + itemData.inventoryType 
                    }
                )
            ),
            nrdMrIds as (
            SELECT modelResourceId, ROW_NUMBER() OVER (
                    ORDER BY modelResourceId
                ) RowNum 
                FROM mrIds
            ),
            randomMrId as (
                SELECT modelResourceId FROM nrdMrIds
                WHERE RowNum = ROUND(? * (SELECT MAX(RowNum) FROM nrdMrIds) + 0.5)
            )
            SELECT * FROM modelResources WHERE modelResourceId = (SELECT * FROM randomMrId)
            ;`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        if (resp.result.length) {
            const supported = await testZamSupportComponentModel(resp.result[0].fileId);
            data = supported ? resp.result : [];
        }
        nrTries++;
    }
    if (nrTries === maxTries) {
        notifyError("Unable to get a random component model! Please report this to a developer!");
        return;
    }
    itemData.itemComponentModels[slot].models = data.map(item => ({
        fileName: item.fileName,
        fileId: item.fileId,
        gender: item.genderId,
        race: item.raceId,
        class: 0,
        extraData: item.extraData
    }));
    await window.store.set('itemData', itemData);
}

export async function hardRandomizeComponentModel(slot: string) {
    const itemData = await window.store.get('itemData');
    if (!componentSlotSupportedForInventoryType(itemData.inventoryType, slot)) {
        return;
    }

    let data: ModelResourceData[]  =[];
    const maxTries = 10;
    let nrTries = 0;
    while (!data.length && nrTries < maxTries) {
        const resp = await window.db.all<ModelResourceData>(`
            WITH mrIds as (
                SELECT DISTINCT modelResourceId
                FROM modelresources
            ),
            nrdMrIds as (
            SELECT modelResourceId, ROW_NUMBER() OVER (
                    ORDER BY modelResourceId
                ) RowNum 
                FROM mrIds
            ),
            randomMrId as (
                SELECT modelResourceId FROM nrdMrIds
                WHERE RowNum = ROUND(? * (SELECT MAX(RowNum) FROM nrdMrIds) + 0.5)
            )
            SELECT * FROM modelResources WHERE modelResourceId = (SELECT * FROM randomMrId)
            ;`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        if (resp.result.length) {
            const supported = await testZamSupportComponentModel(resp.result[0].fileId);
            data = supported ? resp.result : [];
        }
        nrTries++;
    }    
    if (nrTries === maxTries) {
        notifyError("Unable to get a random component model! Please report this to a developer!");
        return;
    }
    itemData.itemComponentModels[slot].models = data.map(item => ({
        fileName: item.fileName,
        fileId: item.fileId,
        gender: item.genderId,
        race: item.raceId,
        class: 0,
        extraData: item.extraData
    }));
    await window.store.set('itemData', itemData);
}

async function testZamSupportComponentModel(componentId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/mo3/${componentId}.mo3`
    const resp = await fetch(uri);
    return resp.ok;
}
