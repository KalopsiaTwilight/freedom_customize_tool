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

    const domTarget = "#geoSetOverrideSection .accordion-body";
    $(`${domTarget} .btn`).each((_, elem) => {
        const tt = Tooltip.getInstance(elem);
        if (tt) { tt.dispose(); }
    })

    $(domTarget).empty();

    // Combine helmetGeoVisMale and helmetGeoVisFemale into 1 container obj
    const geoSetCombined: GenderedItemGeoSetData[] = itemData.helmetGeoVisMale.map(x => ({
        ...x, gender: 0
    }))
    .concat(itemData.helmetGeoVisFemale.map((x) => ({...x, gender: 1})))
    .sort(((a,b) => a.group - b.group));
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

    // Render overrides display
    const currentModelRace = parseInt($("#ci_model_race").val().toString());
    const currentModelGender = parseInt($("#ci_model_gender").val().toString());

    const table = $("<table class='table'>");
    table.append("<thead><tr><th>Model Part<th>Disabled for</th><th></th></tr></thead>")
    const tbody = $("<tbody>");
    for(const group in data) {
        const row = $("<tr>");
        row.append(`<td>${window.WH.Wow.GeoSets[parseInt(group)].title}</td>`)

        const overrideCell = $("<td>");
        const opacityClass = (data[group].findIndex((x) => 
            (x.gender === currentModelGender || x.gender === 2) 
            && x.race === currentModelRace
        ) >= 0) ? "link-opacity-100" : "link-opacity-50";
        const geosetGroupLink = $(`<a class='link-underline-primary ${opacityClass}'>${data[group].length} race/gender combinations</a>`);
        overrideCell.append(geosetGroupLink);
        row.append(overrideCell);

        const buttonCell = $("<td>");
        const removeButton = $("<button class='btn btn-sm btn-outline-danger'><i class='fa-solid fa-x'></i></button>");
        removeButton.on('click', onClearSection(parseInt(group)))
        buttonCell.append(removeButton);
        row.append(buttonCell);

        tbody.append(row);        
        
        let geoSetGroupToolTipText = "";
        for(const item of data[group]) {
            let label = "<span class='text-start'>" + getRaceName(item.race);
            let genderLabel = item.gender === 2 ? "Male & Female" : (item.gender === 0 ? "Male" : "Female");
            label += " - " + genderLabel;
            geoSetGroupToolTipText += label + "</span></br>";
        }

        new Tooltip(geosetGroupLink[0], { customClass: 'tooltip-wide', title: geoSetGroupToolTipText, html: true });
        new Tooltip(removeButton[0], { title: 'Remove', container: 'body'})
    }
    table.append(tbody);
    $(domTarget).append(table);

    // Add buttons
    const btnContainer = $("<div class='d-flex justify-content-between align-items-center'>");
    const addButton = $("<button id='addGsOverride' class='btn btn-dark me-3' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Override</button>");
    addButton.on("click", function () {
        $("#ci_helmetgeovis_gender").val("-1");
        $("#ci_helmetgeovis_race").val("-1");
    })
    btnContainer.append(addButton);

    const clearButton = $("<button type='button' class='btn btn-outline-danger'>Clear</button>");
    clearButton.on('click', onClearOverrides);
    btnContainer.append(clearButton);

    $(domTarget).append(btnContainer);
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
