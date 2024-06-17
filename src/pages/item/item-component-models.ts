import { ModelResourceData } from "../../models";
import { previewCustomItem } from "./preview-item";
import { getClassName, getRaceName } from "./wow-data-utils";

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
            input.val(model.fileName);
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

export async function onAddComponentModel() {
    const itemData = await window.store.get('itemData');
    const componentId = $("#ci_component_id").val().toString();
    const modelData = {
        fileName: $("#ci_componentmodel_modelfile").val().toString(),
        fileId: parseInt($("#ci_componentmodel_fileId").val().toString(), 10),
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
    const resp = await window.db.all(`
        SELECT * FROM modelresources 
        WHERE fileName like '%'|| ?1 || '%'
        OR fileId LIKE '%' || ?1 || '%'
        LIMIT 5`, 
        $("#ci_componentmodel_modelfile").val()
    )
    if (resp.error) {
        throw resp.error;
    }
    const data = resp.result as ModelResourceData[];
    $("#ci_componentmodel_searchResults").empty();
    for (const item of data) {
        const itemElem = $(" <a class='dropdown-item d-flex align-items-center gap-2 py-2' href='#'>")
        itemElem.text(item.fileName);
        itemElem.on("click", function () {
            $("#ci_componentmodel_modelfile").val(item.fileName);
            $("#ci_componentmodel_fileId").val(item.fileId);

            $("#ci_componentmodel_searchResults").empty();
            $("#addComponentModelBtn").removeAttr('disabled');
        });
        const li = $("<li>");
        li.append(itemElem);
        $("#ci_componentmodel_searchResults").append(li);
    }
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
        const data = resp.result as ModelResourceData;
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