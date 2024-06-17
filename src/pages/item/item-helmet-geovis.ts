import { previewCustomItem } from "./preview-item";
import { getRaceName } from "./wow-data-utils";

export async function reloadHelmetGeovisComponents() {
    const itemData = await window.store.get('itemData');
    $("#ci_helmetgeovis_geosetgroup").empty();

    if (itemData.inventoryType === window.WH.Wow.Item.INVENTORY_TYPE_HEAD) {
        $("#geoSetOverrideSection1").parent().show();
        $("#geoSetOverrideSection2").parent().show();
    } else {
        $("#geoSetOverrideSection1").parent().hide();
        $("#geoSetOverrideSection2").parent().hide();
        return;
    }

    for (const geosetId in window.WH.Wow.GeoSets) {
        $("#ci_helmetgeovis_geosetgroup").append($("<option value='" + geosetId + "'>" + window.WH.Wow.GeoSets[geosetId].title + "</option>"))
    }

    $("#ci_helmetgeovis_geosetgroup").val("0");
    $("#ci_helmetgeovis_race").val("1");
    $("#ci_helmetgeovis_gender").val("");

    $("#geoSetOverrideSection1 .accordion-body").empty();
    $("#geoSetOverrideSection2 .accordion-body").empty();

    for (let i = 0; i < itemData.helmetGeoVisMale.length; i++) {
        const gsOverride = itemData.helmetGeoVisMale[i];
        const formGroup = $("<div class='form-group mb-3' />");
        let label = window.WH.Wow.GeoSets[gsOverride.group].title;
        label += " - " + getRaceName(gsOverride.race);
        formGroup.append($("<label for='ci_gsOverride_m_" + i + "' class='form-label'>" + label + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const input = $("<input id='ci_gsOverride_m_" + i + "' class='form-control' readonly type='text' />");
        input.val("Disabled");
        inputGroup.append(input);
        const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
        removeButton.on("click", onRemoveHelmetGeovis(true, i));
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $("#geoSetOverrideSection1 .accordion-body").append(formGroup);
    }
    const buttonM = $("<button id='addGsOverrideM' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Geoset Override</button>");
    buttonM.on("click", function () {
        $("#ci_helmetgeovis_gender").val("0");
    })
    $("#geoSetOverrideSection1 .accordion-body").append(buttonM);

    for (let i = 0; i < itemData.helmetGeoVisFemale.length; i++) {
        const gsOverride = itemData.helmetGeoVisFemale[i];
        const formGroup = $("<div class='form-group mb-3' />");
        let label = window.WH.Wow.GeoSets[gsOverride.group].title;
        label += " - " + getRaceName(gsOverride.race);
        formGroup.append($("<label for='ci_gsOverride_m_" + i + "' class='form-label'>" + label + "</label>"));
        const inputGroup = $("<div class='input-group' />");
        const input = $("<input id='ci_gsOverride_m_" + i + "' class='form-control' readonly type='text' />");
        input.val("Disabled");
        inputGroup.append(input);
        const removeButton = $("<button type='button' class='btn btn-outline-danger'>Remove</button>")
        removeButton.on("click", onRemoveHelmetGeovis(false, i));
        inputGroup.append(removeButton)
        formGroup.append(inputGroup);
        $("#geoSetOverrideSection2 .accordion-body").append(formGroup);
    }
    const buttonF = $("<button id='addGsOverrideF' class='btn btn-dark' data-bs-toggle='modal' data-bs-target='#addGeosetOverrideModal'>Add Geoset Override</button>")
    buttonF.on("click", function () {
        $("#ci_helmetgeovis_gender").val("1");
    });
    $("#geoSetOverrideSection2 .accordion-body").append(buttonF);
}

function onRemoveHelmetGeovis(male: boolean, index: number) {
    return async function () {
        const itemData = await window.store.get('itemData');
        if (male) {
            itemData.helmetGeoVisMale.splice(index, 1);
        } else {
            itemData.helmetGeoVisFemale.splice(index, 1);
        }
        await window.store.set('itemData', itemData);
        await reloadHelmetGeovisComponents();
        await previewCustomItem();
    }
}

export async function onAddGeoSetOverride() {
    const itemData = await window.store.get('itemData');
    const overridedata = {
        group: parseInt($("#ci_helmetgeovis_geosetgroup").val().toString(), 10),
        race: parseInt($("#ci_helmetgeovis_race").val().toString(), 10),
    }
    if ($("#ci_helmetgeovis_gender").val() === "0") {
        itemData.helmetGeoVisMale.push(overridedata);
    } else {
        itemData.helmetGeoVisFemale.push(overridedata);
    }
    await window.store.set('itemData', itemData);
    await reloadHelmetGeovisComponents();
    await previewCustomItem();
}
