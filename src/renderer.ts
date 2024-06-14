/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 */
import "@fortawesome/fontawesome-free/js/all";
import 'bootstrap'
import 'gasparesganga-jquery-loading-overlay'
import './shared/app.scss';

window.jQuery = $;
window.$ = $;

$.LoadingOverlaySetup({
    background: "rgba(190,190,190, 0.8)"
});

$.LoadingOverlay("show");
// window.ipcRenderer.on("server-running", () => {
window.api.getExpressAppUrl().then(uri => {
    window.EXPRESS_URI = uri;
    const checkServerRunning = setInterval(() => {
        fetch(uri)
            .then((response) => {
                console.log("EXPRESS RETURNED: " + response.status)
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

window.ipcRenderer.on("express-log", (_e, data: string) => {
    console.log(data);
})