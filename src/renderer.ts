import "@fortawesome/fontawesome-free/js/all";
import 'gasparesganga-jquery-loading-overlay'
import './shared/app.scss';
import { OnFirstStartChannel } from "./ipc/channels";

import { loadPage as loadItemPage } from "./pages/item/item"


window.jQuery = $;
window.$ = $;

import * as bootstrap from 'bootstrap'

$.LoadingOverlaySetup({
    background: "rgba(190,190,190, 0.8)"
});

loadItemPage();
window.ipcRenderer.on(OnFirstStartChannel, (_, obj: any) => {
    $("#firstTimeConfigModal").modal('show');
    $("#ftc_wowPath").val(obj.suggestedDir);
    if (obj.launchWoWAfterPatch) {
        $("#ftc_launchWoWAfterPatch").attr('checked', 'true');
    }
});

$("#setFirstTimeConfig").on("click", function () {
    window.store.set("freedomWoWRootDir", $("#ftc_wowPath").val().toString());
    window.store.set("launchWoWAfterPatch", $("#ftc_launchWoWAfterPatch").is(':checked'));
})

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))