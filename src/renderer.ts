import "@fortawesome/fontawesome-free/js/all";
import 'gasparesganga-jquery-loading-overlay'
import './shared/app.scss';
import { OnFirstStartChannel } from "./ipc/channels";

import { loadPage as loadItemPage, unloadPage as unloadItemPage} from "./pages/item"
import { loadPage as loadPrefPage } from "./pages/preferences"


window.jQuery = $;
window.$ = $;

import * as bootstrap from 'bootstrap'

$.LoadingOverlaySetup({
    background: "rgba(190,190,190, 0.8)"
});

let currentPage = "#item";

$(function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    
    window.ipcRenderer.on(OnFirstStartChannel, (_, obj: any) => {
        $("#firstTimeConfigModal").modal('show');
        $("#ftc_wowPath").val(obj.suggestedDir);
        if (obj.launchWoWAfterPatch) {
            $("#ftc_launchWoWAfterPatch").attr('checked', 'true');
        }
    });

    $("#setFirstTimeConfig").on("click", async function () {
        const pref = await window.store.get('settings');
        pref.freedomWoWRootDir = $("#ftc_wowPath").val().toString();
        pref.launchWoWAfterPatch = $("#ftc_launchWoWAfterPatch").is(':checked');
        await window.store.set("settings", pref);
    })

    
    $("nav a").each((_, elem) => {
        $(elem).on("click", function () {
            if (currentPage !== this.getAttribute("href")) {
                unloadPage();
                currentPage = this.getAttribute("href");
                loadPage();
            }
        })
    })
    
    loadPage();
})

function loadPage() {
    switch(currentPage) {
        case "#item": loadItemPage(); break;
        case "#preferences": loadPrefPage(); break;
    }
}

function unloadPage() {
    switch(currentPage) {
        case "#item": unloadItemPage(); break;
    }
}
