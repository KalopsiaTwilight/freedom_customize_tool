import log from "electron-log/renderer"
import html from "./item.html"

import { setUpWowHeadConfig } from "./wowhead-setup"


export function loadPage() {
    $.LoadingOverlay("show");
    $("#pageContent").html(html);
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
                            setUpWowHeadConfig();
                            require("./item-setup");
                        });
                    }
                })
                .catch(() => { })
        }, 1000)
    })
}