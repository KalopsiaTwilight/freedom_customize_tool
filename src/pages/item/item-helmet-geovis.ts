import { Tooltip } from "bootstrap"

import { GenderedItemGeoSetData, ItemGeoSetData } from "../../models";

import { previewCustomItem } from "./preview-item";
import { getPlayerRaces, getRaceName } from "./wow-data-utils";

export async function reloadHelmetGeovisComponents() {
    const itemData = await window.store.get('itemData');
    $("#ci_helmetgeovis_geosetgroup").empty();

    if (itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_HEAD) {
        $("#geoSetOverrideSection").parent().show();
    } else {
        $("#geoSetOverrideSection").parent().hide();
        return;
    }

    for (const geosetId in window.WH.Wow.GeoSets) {
        $("#ci_helmetgeovis_geosetgroup").append($("<option value='" + geosetId + "'>" + window.WH.Wow.GeoSets[geosetId].title + "</option>"))
    }

    $("#ci_helmetgeovis_geosetgroup").val("0");
    $("#ci_helmetgeovis_race").val("1");
    $("#ci_helmetgeovis_gender").val("");

    $("#geoSetOverrideSection .accordion-body").empty();

    const geoSetCombined: GenderedItemGeoSetData[] = itemData.helmetGeoVisMale.map(x => ({
        ...x, gender: 0
    })).concat(itemData.helmetGeoVisFemale.map((x) => ({...x, gender: 1})))

    const data = geoSetCombined.reduce((acc, next) => {
        if (acc[next.group]) {
            const currentRaceIndex = acc[next.group].findIndex((i) => i.race === next.race && i.gender !== next.gender);
            if (currentRaceIndex >= 0) {
                acc[next.group][currentRaceIndex].gender = 2;
            } else {
                acc[next.group].push(next)
            }
        } else {
            acc[next.group] = [next]
        }
        return acc;
    }, {} as {[key: string]: { race: number, gender: number}[]})

    const currentModelRace = parseInt($("#ci_model_race").val().toString());
    const currentModelGender = parseInt($("#ci_model_gender").val().toString());
    for(const group in data) {
        const groupContainer = $("<div class='d-flex justify-content-between align-items-center mb-2'>");
        const opacityClass = (data[group].findIndex(
            (x) => (x.gender === currentModelGender || x.gender === 2) && x.race === currentModelRace) >= 0
        ) ? "link-opacity-100" : "link-opacity-50";
        const geosetGroupLink = $(`<a class='link-underline-primary ${opacityClass}' data-bs-toggle="tooltip" data-bs-html="true">${data[group].length} race/gender combinations</a>`);
        let geoSetGroupToolTipText = "";
        for(const item of data[group]) {
            let label = "<span class='text-start'>" + getRaceName(item.race);
            let genderLabel = item.gender === 2 ? "Male & Female" : (item.gender === 0 ? "Male" : "Female");
            label += " - " + genderLabel;
            geoSetGroupToolTipText += label + "</span></br>";
        }
        $(geosetGroupLink).attr('data-bs-title', geoSetGroupToolTipText);
        let label = window.WH.Wow.GeoSets[parseInt(group)].title;
        groupContainer.append(`<span class='text-start'>${label}</span>`)

        const comboContainer = $("<div>");
        comboContainer.append(`<span>for </span>`)

        comboContainer.append(geosetGroupLink);
        $("#geoSetOverrideSection .accordion-body").append(groupContainer);

        const removeButton = $("<button class='ms-3 btn btn-sm btn-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on('click', onClearSection(parseInt(group)))
        comboContainer.append(removeButton);

        groupContainer.append(comboContainer);
        new Tooltip(geosetGroupLink[0], { customClass: 'tooltip-wide' });
        new Tooltip(removeButton[0], { title: 'Clear override'})
    }

    const addButton = $("<button id='addGsOverride' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Override</button>");
    addButton.on("click", function () {
        $("#ci_helmetgeovis_gender").val("-1");
        $("#ci_helmetgeovis_race").val("-1");
    })
    $("#geoSetOverrideSection .accordion-body").append(addButton);

    const clearButton = $("<button type='button' class='btn btn-outline-danger me-3'>Clear</button>");
    clearButton.on('click', onClearOverrides);
    $("#geoSetOverrideSection .accordion-body").append(clearButton);
}

function onClearSection(section: number) {
    return async () => {
        const itemData = await window.store.get('itemData');
        itemData.helmetGeoVisFemale = itemData.helmetGeoVisFemale.filter(x => x.group !== section);
        itemData.helmetGeoVisMale = itemData.helmetGeoVisMale.filter(x => x.group !== section);
        await window.store.set('itemData', itemData);
        await previewCustomItem();
        await reloadHelmetGeovisComponents();
    }
}

async function onClearOverrides() {
    const itemData = await window.store.get('itemData');
    itemData.helmetGeoVisFemale = [];
    itemData.helmetGeoVisMale = [];
    await window.store.set('itemData', itemData);
    await previewCustomItem();
    await reloadHelmetGeovisComponents();
}

export async function onAddGeoSetOverride() {
    const itemData = await window.store.get('itemData');
    
    const group = parseInt($("#ci_helmetgeovis_geosetgroup").val().toString(), 10);
    const inputRace = parseInt($("#ci_helmetgeovis_race").val().toString(), 10);
    const gender = parseInt($("#ci_helmetgeovis_gender").val().toString());

    const pushToGenderedArray = (data: ItemGeoSetData) => {
        const addAndTest = (arr: ItemGeoSetData[]) => {
            if (arr.findIndex((x) => x.race === data.race && x.group === data.group) === -1) {
                arr.push(data);
            }
        }
        if (gender === -1) {
            addAndTest(itemData.helmetGeoVisMale);
            addAndTest(itemData.helmetGeoVisFemale);
        } else if (gender === 0) {
            addAndTest(itemData.helmetGeoVisMale);
        } else {
            addAndTest(itemData.helmetGeoVisFemale);
        }
    }
    if (inputRace === -1) {
        for(const race of getPlayerRaces()) {
            pushToGenderedArray({ group, race});
        }
    } else {
        pushToGenderedArray({ group, race: inputRace});
    }
    await window.store.set('itemData', itemData);
    await reloadHelmetGeovisComponents();
    await previewCustomItem();
}
