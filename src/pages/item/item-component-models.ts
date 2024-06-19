import { ModelResourceData } from "../../models";
import { notifyError } from "../../utils/alerts";
import { previewCustomItem } from "./preview-item";
import { getClassName, getRaceName, getWowHeadThumbForDisplayId } from "./wow-data-utils";

import { Modal } from "bootstrap"

import fallbackImg from "../../assets/unknown.webp"

export async function reloadComponentModels() {
    const itemData = await window.store.get('itemData');

    $("#ci_componentmodel_modelfile").val("");
    $("#ci_componentmodel_fileId").val("")
    $("#ci_componentmodel_gender").val("3");
    $("#ci_componentmodel_race").val("0");
    $("#ci_componentmodel_class").val("0");
    $("#ci_componentmodel_extradata").val("-1");
    $("#addComponentModelBtn").attr('disabled', 'true');

    $("#component1ModelsSection .accordion-body").empty();
    $("#component2ModelsSection .accordion-body").empty();

    for (const idStr in itemData.itemComponentModels) {
        const data = itemData.itemComponentModels[idStr];
        const id = +idStr + 1;

        for (let i = 0; i < data.models.length; i++) {
            const model = data.models[i];
            const formGroup = $("<div class='form-group mb-3' />");
            let label = "Male & Female"
            if (model.gender !== 3) {
                label = (model.gender === 0 ? "Male" : "Female")
            }
            if (model.extraData !== -1) {
                label += " - " + (model.extraData === 0 ? "Left Shoulderpad" : "Right Shoulderpad")
            }
            if (model.race !== 0) {
                label += " - " + getRaceName(model.race);
            }
            if (model.class !== 0) {
                label += " - " + getClassName(model.class);
            }
            formGroup.append($("<label for='ci_componentModel" + id + "_" + i + "' class='form-label'>" + label + "</label>"));
            const inputGroup = $("<div class='input-group' />");
            const input = $("<input id='ci_componentModel" + id + "_" + i + "' class='form-control' readonly type='text' />");
            input.val(`${model.fileId} - ${model.fileName}`);
            inputGroup.append(input);
            const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
            removeButton.on("click", onRemoveComponentModel(idStr, i));
            inputGroup.append(removeButton)
            formGroup.append(inputGroup);

            $("#component" + id + "ModelsSection .accordion-body").append(formGroup);
        }

        const button = $("<button type='button' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addComponentModelModal'>Add Model</button>");
        button.on("click", function () {
            $("#ci_component_id").val(idStr);
            $("#ci_componentmodel_modelfile").val("");
            $("#ci_preview_page").val(0);
            onSearchComponentModel();
        });
        $("#component" + id + "ModelsSection .accordion-body").append(button)
        const randomizeButton2 = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
        randomizeButton2.on("click", idStr === "0" ? onRandomizeComponent1Model : onRandomizeComponent2Model);
        $("#component" + id + "ModelsSection .accordion-body").append(randomizeButton2);
    }
}

function onRemoveComponentModel(idStr: string, i: number) {
    return async function () {
        const itemData = await window.store.get('itemData');
        itemData.itemComponentModels[idStr].models.splice(i, 1);
        await window.store.set('itemData', itemData);
        await reloadComponentModels();
        await previewCustomItem();
    }
}

async function onAddComponentModel(fileName: string, fileId: number) {
    const modelSupported = await testZamSupportComponentModel(fileId);
    if (!modelSupported) {
        notifyError("Oops! Looks like the component model you selected isn't supported anymore, please select a new model.")
        return;
    }

    const itemData = await window.store.get('itemData');
    const componentId = $("#ci_component_id").val().toString();
    const modelData = {
        fileName,
        fileId,
        gender: 3,
        race: 0,
        class: 0,
        extraData: parseInt($("#ci_componentmodel_extraData").val().toString(), 10)
    };
    itemData.itemComponentModels[componentId].models.push(modelData);
    await window.store.set('itemData', itemData);
    await reloadComponentModels();
    await previewCustomItem();
}

export async function onSearchComponentModel() {
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 4;
    const fromAndFilterQuery = `
        FROM modelresources MR1
        WHERE 
            (MR1.fileName like '%'|| ?1 || '%' OR MR1.fileId LIKE '%' || ?1 || '%')
        AND 
            MR1.fileId = (
                SELECT MIN(MR2.fileId) FROM modelresources MR2 WHERE MR2.modelResourceId = MR1.modelResourceId
            )
    `;
    const resp = await window.db.all<ModelResourceData>(`
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
        `SELECT COUNT(*) total ${fromAndFilterQuery}`,
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
        linkElem.append(`<p>${item.fileName}</p>`)
        linkElem.on("click", function () {
            onAddComponentModel(item.fileName, item.fileId);
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
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchComponentModel();
}

export async function onRandomizeComponent1Model() {
    $.LoadingOverlay("show");
    await randomizeComponentModel("0");
    await reloadComponentModels();
    await previewCustomItem();
    $.LoadingOverlay("hide");
}

export async function onRandomizeComponent2Model() {
    $.LoadingOverlay("show");
    await randomizeComponentModel("1");
    await reloadComponentModels();
    await previewCustomItem();
    $.LoadingOverlay("hide");
}

export async function randomizeComponentModel(slot: string) {
    const itemData = await window.store.get('itemData');
    const promises = [];
    let loops = 1;
    if (itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS) {
        loops = 2;
    }
    for (let i = 0; i < loops; i++) {
        let data: ModelResourceData | null = null;
            while (!data) {
                const resp = await window.db.get(`
                SELECT r1.fileId, r1.fileName
                FROM modelresources AS r1 
                JOIN (SELECT CEIL(?1 * (SELECT MAX(fileId) FROM modelresources)) AS fileId) AS r2
                WHERE r1.fileId >= r2.fileId
                ORDER BY r1.fileId ASC
                LIMIT 1`, 
                Math.random()
            );
            if (resp.error) {
                throw resp.error;
            }
            data = resp.result as ModelResourceData;
            const supported = await testZamSupportComponentModel(data.fileId);
            if (!supported) {
                data = null;
            }
        }
       
        itemData.itemComponentModels[slot].models = [{
            fileName: data.fileName,
            fileId: data.fileId,
            gender: 3,
            race: 0,
            class: 0,
            extraData: itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_SHOULDERS ? i : -1
        }]
    }
    await window.store.set('itemData', itemData);
}

async function testZamSupportComponentModel(componentId: number) {
    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/mo3/${componentId}.mo3`
    const resp = await fetch(uri);
    return resp.ok;
}
