import log from "electron-log/renderer"

import { PatchResult } from "../models";
import { OnPatchToolExitChannel } from "../ipc/channels";
import { inventoryTypeToItemId, inventoryTypeToItemSlotName } from "../utils";

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
                $("#alertError")
                    .text("Something went wrong applying the patch to the WoW clientfiles. Please contact a developer for help!")
                    .show();
                $("#alertSuccess").empty().hide();
            } else {
                const itemData = await window.store.get('itemData');
                const itemId = inventoryTypeToItemId(itemData.inventoryType);
                const itemName = "Custom Item TestItem - " + inventoryTypeToItemSlotName(itemData.inventoryType)
                $("#alertError").empty().hide();
                $("#alertSuccess")
                    .text(`Succesfully applied patch! Add item ${itemId} [${itemName}] to your character to view the item in-game!`)
                    .show();
            }
            $.LoadingOverlay("hide");
        })

        const uri = await window.api.getExpressAppUrl();
        window.EXPRESS_URI = uri;
        const checkServerRunning = setInterval(async () => {
            const response = await fetch(uri)
            log.info("EXPRESS RETURNED: " + response.status)
            if (response.status === 200) {
                clearInterval(checkServerRunning);
                $.LoadingOverlay("hide");
                $.getScript(`${uri}/zam/modelviewer/live/viewer/viewer.min.js`).then(() => {
                    if (!window.CONTENT_PATH) {
                        window.CONTENT_PATH = `${uri}/zam/modelviewer/live/`
                    }
                    setUpWowHeadConfig();
                    itemSetup = require("./item/item-setup")
                    itemSetup.default();
                });
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