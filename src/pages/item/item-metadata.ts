import { Modal, Tooltip } from "bootstrap";

import { notifyError } from "../../utils/alerts";
import { armorSubClassToName, isArmorInventoryType, weaponSubClassToName } from "../../utils";
import { ArmorSubclass, IconFileData, InventoryType, WeaponSubclass } from "../../models";
import { fallbackImg } from "./consts";

export async function reloadItemMetadata() {
    const itemData = await window.store.get('itemData');

    // Load Item Icon
    $("#ci_name").val(itemData.metadata.name);
    $("#ci_iconFileId").val(itemData.metadata.fileIconName);
    const imgSrc = `${window.EXPRESS_URI}/zam/images/wow/icons/medium/${itemData.metadata.fileIconName.replace('.blp', '.jpg')}`
    $(".item-icon-container .item-icon").attr('src', imgSrc);
    $(".item-icon-container .item-icon-border").attr('src', `${window.EXPRESS_URI}/zam/images/Icon/medium/border/default.png`)

    // Load Rarity
    $("#ci_rarity").val(itemData.metadata.rarity);

    // Load Subclass&SheatheType
    $("#ci_subclass").empty();
    if (isArmorInventoryType(itemData.inventoryType)) {
        $("#ci_subclass").attr('disabled', 'disabled');
        for(const subClass in ArmorSubclass) {
            const subClassId = parseInt(subClass, 10);
            if (isNaN(subClassId)) {
                continue;
            }
            $("#ci_subclass").append(`<option value='${subClassId}'>${armorSubClassToName(subClassId)}</option>`)
        }

        if (itemData.inventoryType !== InventoryType.Shield && itemData.inventoryType !== InventoryType.HeldInOffHand) {  
            $("#ci_sheatheType").attr('disabled', 'disabled');
        } else {
            $("#ci_sheatheType").removeAttr('disabled');
        }
    } else {
        $("#ci_sheatheType").removeAttr('disabled');
        $("#ci_subclass").removeAttr('disabled');
        for(const subClass in WeaponSubclass) {
            const subClassId = parseInt(subClass, 10);
            if (isNaN(subClassId)) {
                continue;
            }
            $("#ci_subclass").append(`<option value='${subClassId}'>${weaponSubClassToName(subClassId)}</option>`)
        }
    }
    $("#ci_subclass").val(itemData.metadata.subClass);
    $("#ci_sheatheType").val(itemData.metadata.sheatheType);
}

export async function onClearItemMetadata() {
    const itemData = await window.store.get('itemData');
    itemData.metadata.fileIconId = 0;
    itemData.metadata.fileIconName = 'inv_misc_questionmark.blp'
    await window.store.set('itemData', itemData);
    await reloadItemMetadata();
}

async function onSetFileIcon(fileName: string, fileId: number) {
    const itemData = await window.store.get('itemData');
    itemData.metadata.fileIconId = fileId;
    itemData.metadata.fileIconName = fileName;
    await window.store.set('itemData', itemData);
    await reloadItemMetadata();
}

export async function onSearchItemMetadata() {
    const page = parseInt($("#ci_preview_page").val().toString());
    const pageSize = 40;

    let fromAndWhere = `
        FROM iconFiles IF
        WHERE (IF.fileName LIKE '%' || ?1 || '%' 
        OR    IF.fileId LIKE '%' || ?1 || '%') 
    `;
    const inventoryTypeFilter = parseInt($("#ci_itemIcon_inventorySlotFilter").val().toString(), 10);
    if (inventoryTypeFilter >= 0) {
        fromAndWhere += `               
        AND IF.fileId IN (
            SELECT ITIF.fileId
            FROM inventoryslot_to_iconfile ITIF
            WHERE ITIF.inventoryType = ${inventoryTypeFilter}
        )`
    }
    const resp = await window.db.all<IconFileData>(`
        SELECT *
        ${fromAndWhere}
        ORDER BY IF.fileId DESC
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}`,
        $("#ci_itemIcon_filename").val()
    );
    if (resp.error) {
        throw resp.error;
    }

    const total = await window.db.get<{total: number}>(
        `SELECT COUNT(*) total ${fromAndWhere}`,
        $("#ci_itemIcon_filename").val()
    );
    
    $("#ci_itemIcon_resultsPreview a").each((_, elem) => {
        const tt = Tooltip.getInstance(elem);
        if (tt) { tt.dispose(); }
    })
    $("#ci_itemIcon_resultsPreview").empty();
    const row = $("<div class='row'>");
    for (const icon of resp.result) {
        const col = $("<div class='col mb-3'>");
        const linkElem = $("<a role='button' class='item-icon-container-lg'>");

        const imgContainer = $("<div class='item-icon-container-lg'>");

        const imgUri = `${window.EXPRESS_URI}/zam/images/wow/icons/large/${icon.fileName.replace('.blp', '.jpg')}`
        const img = $(`<img src="${imgUri}" class="item-icon" />`);
        imgContainer.append(img);
        img.on('error', function () {
            $(this).attr('src', fallbackImg);
        })

        const borderUri = `${window.EXPRESS_URI}/zam/images/Icon/large/border/default.png`
        const borderImg = $(`<img src="${borderUri}" class="item-icon-border" />`);
        imgContainer.append(borderImg);

        linkElem.append(imgContainer);
        linkElem.on("click", function () {
            onSetFileIcon(icon.fileName, icon.fileId);
            Tooltip.getInstance(this).hide();
            Modal.getOrCreateInstance("#pickItemIconModal").hide();
        });
        new Tooltip(linkElem[0], { title: icon.fileName });
        col.append(linkElem);
        row.append(col);
    }
    $("#ci_itemIcon_resultsPreview").append(row);
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
    $("#ci_itemIcon_resultsPreview").append(bottomContainer);
}

function nextPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage + 1);
    onSearchItemMetadata();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

function prevPage() {
    const curPage = parseInt($("#ci_preview_page").val().toString());
    $("#ci_preview_page").val(curPage - 1);
    onSearchItemMetadata();
    $(this).parent().find("button").attr('disabled', 'disabled');
}

export async function randomizeItemMetadata() {
    const itemData = await window.store.get('itemData');

    let data: IconFileData | null = null;
    const maxTries = 10;
    let nrTries = 0;
    while (!data && nrTries < maxTries) {
        const resp = await window.db.get<IconFileData>(`
            SELECT *
            FROM iconFiles IF
            JOIN inventoryslot_to_iconfile II ON IF.fileId = II.fileId 
            WHERE IF.fileId >= ROUND(? * (SELECT MAX(fileId) FROM iconFiles) + 0.5)
            AND II.inventoryType ${
                itemData.inventoryType === InventoryType.Chest ?
                    "IN (4,5,20)" :
                itemData.inventoryType === InventoryType.OneHand ? 
                    "IN (13, 21, 22)" : "= " + itemData.inventoryType
            }
            LIMIT 1`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        data = resp.result;
        nrTries++;
    }    
    if (nrTries === maxTries) {
        notifyError("Unable to get a random icon file! Please report this to a developer!");
        return;
    }

    itemData.metadata.fileIconId = data.fileId;
    itemData.metadata.fileIconName = data.fileName;
    await window.store.set('itemData', itemData);
}

export async function hardRandomizeItemMetadata() {
    const itemData = await window.store.get('itemData');

    let data: IconFileData | null = null;
    const maxTries = 10;
    let nrTries = 0;
    while (!data && nrTries < maxTries) {
        const resp = await window.db.get<IconFileData>(`
            SELECT *
            FROM iconFiles
            WHERE fileId >= ROUND(? * (SELECT MAX(fileId) FROM iconFiles) + 0.5)
            LIMIT 1`, 
            Math.random()
        );
        if (resp.error) {
            throw resp.error;
        }
        data = resp.result;
        nrTries++;
    }    
    if (nrTries === maxTries) {
        notifyError("Unable to get a random icon file! Please report this to a developer!");
        return;
    }

    itemData.metadata.fileIconId = data.fileId;
    itemData.metadata.fileIconName = data.fileName;
    await window.store.set('itemData', itemData);
}