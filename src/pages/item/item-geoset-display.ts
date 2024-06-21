import { previewCustomItem } from "./preview-item";
import { getGeoSetsForInventoryType } from "./wow-data-utils";

export async function reloadGeosetDisplay() {
    const itemData = await window.store.get('itemData');

    const domTarget = "#geosetSection";

    $(domTarget).empty();

    let geoSets = getGeoSetsForInventoryType(itemData.inventoryType);
    for (let i = 0; i < geoSets.length; i++) {
        const set = geoSets[i];
        const geoSetData = window.WH.Wow.GeoSets[set];
        const formGroup = $("<div class='form-group mb-3' />");
        formGroup.append($("<label for='ci_geoset_" + set + "' class='form-label'>" + geoSetData.title + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const select = $("<select id='ci_geoset_" + set + "' class='form-select' />");
        for (const opt of geoSetData.options) {
            select.append("<option value='" + opt.value + "'>" + opt.name + "</option>");
        }
        select.on('change', onGeoSetDisplayChange(set))
        inputGroup.append(select);
        formGroup.append(inputGroup);
        $(domTarget).append(formGroup);
        $("#ci_geoset_" + set).val(itemData.geoSetGroup[i]);
    }

    const randomizeButton = $("<button type='button' class='btn btn-secondary me-3'>Randomize</button>");
    randomizeButton.on("click", onRandomizeGeosetData);
    $(domTarget).append(randomizeButton);
}

function onGeoSetDisplayChange(set: number) {
    return async function () {  
        const itemData = await window.store.get('itemData');
        const geoSets = getGeoSetsForInventoryType(itemData.inventoryType);
        itemData.geoSetGroup[geoSets.indexOf(set)] = parseInt($("#ci_geoset_" + set).val().toString())
        await window.store.set("itemData", itemData);
        await previewCustomItem();
    }
}

export async function onRandomizeGeosetData() {
    await randomizeGeoSetData();
    await previewCustomItem();
}

export async function randomizeGeoSetData() {
    const itemData = await window.store.get('itemData');
    let geoSets = getGeoSetsForInventoryType(itemData.inventoryType);
    for (let i = 0; i < geoSets.length; i++) {
        const geoSetData = window.WH.Wow.GeoSets[geoSets[i]];
        const option = geoSetData.options[Math.floor(Math.random() * geoSetData.options.length)];
        $("#ci_geoset_" + geoSets[i]).val(option.value);
        itemData.geoSetGroup[i] = option.value;
    }
    await window.store.set('itemData', itemData);
}

