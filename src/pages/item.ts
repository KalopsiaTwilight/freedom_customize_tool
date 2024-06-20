import log from "electron-log/renderer"

import { PatchResult } from "../models";
import { OnPatchToolExitChannel } from "../ipc/channels";
import { inventoryTypeToItemId, inventoryTypeToItemSlotName } from "../utils";
import { notifyError, notifySuccess } from "../utils/alerts"

import html from "./item.html"
import { setUpWowHeadConfig } from "./item/wowhead-setup"

let itemSetup: any;

$.LoadingOverlay("hide");


export async function loadPage() {
    $.LoadingOverlay("show");
    $("#pageContent").html(html);
    if (!window.ZamModelViewer) {
        window.ipcRenderer.on(OnPatchToolExitChannel, async (_, output: PatchResult) => {
            if (output.resultCode != 0) {
                notifyError("Something went wrong applying the patch to the WoW clientfiles. Please contact a developer for help!")
            } else {
                const itemData = await window.store.get('itemData');
                const itemId = inventoryTypeToItemId(itemData.inventoryType);
                const itemName = "Custom Item TestItem - " + inventoryTypeToItemSlotName(itemData.inventoryType)
                notifySuccess(`Succesfully applied patch! Add item ${itemId} [${itemName}] to your character to view the item in-game!`);
            }
            $.LoadingOverlay("hide");
        })

        const uri = await window.api.getExpressAppUrl();
        window.EXPRESS_URI = uri;
        const checkServerRunning = setInterval(async () => {
            const response = await fetch(uri)
            log.info("[RENDERER] EXPRESS RETURNED: " + response.status)
            if (response.status === 200) {
                clearInterval(checkServerRunning);
                $.LoadingOverlay("hide");
                setUpWowHeadConfig();
                await $.getScript(`${uri}/zam/modelviewer/live/viewer/viewer.min.js`)
                if (!window.CONTENT_PATH) {
                    window.CONTENT_PATH = `${uri}/zam/modelviewer/live/`
                }
                itemSetup = require("./item/item-setup")
                itemSetup.default();
            }
        }, 1000)
    }
    else {
        itemSetup = require("./item/item-setup");
        itemSetup.default();
        $.LoadingOverlay("hide");
    }
}

export function unloadPage() {
    itemSetup.unload();
}