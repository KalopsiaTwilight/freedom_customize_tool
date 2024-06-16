import log from "electron-log/renderer"

import "@fortawesome/fontawesome-free/js/all";
import 'gasparesganga-jquery-loading-overlay'
import './shared/app.scss';
import { OnFirstStartChannel } from "./ipc/channels";


window.jQuery = $;
window.$ = $;

import 'bootstrap'

$.LoadingOverlaySetup({
    background: "rgba(190,190,190, 0.8)"
});

$.LoadingOverlay("show");

window.api.getExpressAppUrl().then(uri => {
    window.EXPRESS_URI = uri;
    const checkServerRunning = setInterval(() => {
        fetch(uri)
            .then((response) => {
                log.info("EXPRESS RETURNED: " + response.status)
                if (response.status === 200) {
                    clearInterval(checkServerRunning);
                    $.LoadingOverlay("hide");
                    $.getScript(`${uri}/zam/modelviewer/live/viewer/viewer.min.js`).then(() => {
                        if (!window.CONTENT_PATH) {
                            window.CONTENT_PATH = `${uri}/zam/modelviewer/live/`
                        }
                        require("./app/customItem")
                    });
                }
            })
            .catch(() => { })
    }, 1000)
})
window.ipcRenderer.on(OnFirstStartChannel, (_, obj: any) => {
    $("#firstTimeConfigModal").modal('show');
    $("#ftc_wowPath").val(obj.suggestedDir);
    if (obj.launchWoWAfterPatch) {
        $("#ftc_launchWoWAfterPatch").attr('checked', 'true');
    }
});

$("#setFirstTimeConfig").on("click", function () {
    window.api.setupConfig($("#ftc_wowPath").val() as string, $("#ftc_launchWoWAfterPatch").is(':checked'))
})