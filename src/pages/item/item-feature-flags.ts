import { previewCustomItem } from "./preview-item";

export async function reloadFlagsComponents() {
    const itemData = await window.store.get('itemData');
    $("#flagsSection .accordion-body").empty();
    for (const flag in window.WH.Wow.ItemFeatureFlags) {
        const flagId = parseInt(flag, 10);
        const elem = $("<div class='form-check'>");
        const checkbox = $("<input class='form-check-input' type='checkbox' id='cb_flag_" + flag + "' />");
        if ((itemData.flags & flagId) > 0) {
            checkbox.attr('checked', 'true');
        }
        checkbox.on('click', onFlagToggle(flagId))
        elem.append(checkbox);
        elem.append("<label class='form-check-label' for='id='cb_flag_" + flag + "'>" + window.WH.Wow.ItemFeatureFlags[flag] + "</label>");
        $("#flagsSection .accordion-body").append(elem);
    }
}

function onFlagToggle(flagId: number) {
    return async function () {
        const itemData = await window.store.get('itemData');
        if ((itemData.flags & flagId) > 0) {
            itemData.flags -= flagId;
        } else {
            itemData.flags += flagId;
        }
        await window.store.set('itemData', itemData);
        await previewCustomItem();
    }
}