import { previewCustomItem } from "./preview-item";

export async function reloadFlagsComponents() {
    const itemData = await window.store.get('itemData');

    const domTarget = "#flagsSection .accordion-body";

    $(domTarget).empty();
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
        $(domTarget).append(elem);
    }

    const btnContainer = $("<div class='d-flex justify-content-end'>");
    const clearButton = $("<button type='button' class='btn btn-outline-danger'>Clear</button>");
    clearButton.on('click', onClearFlags);
    btnContainer.append(clearButton);

    $(domTarget).append(btnContainer);
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

async function onClearFlags() {
    const itemData = await window.store.get('itemData');
    itemData.flags = 0;
    await window.store.set('itemData', itemData);
    await previewCustomItem();
}