import log from "electron-log/node"
import Store from "electron-store"
import express from "express";
import proxy from "express-http-proxy";
import http from "http";
import cors from "cors"
import { AddressInfo } from "node:net"
import EventEmitter from "node:events"

import { BONEFile, CASCLocal, LocaleFlag, M2File, MO3Converter, MO3File, constants } from "./wowFiles";
import { ExpressPortInfoType, isSendWoWMessage } from "./ipc/expressIPC";

const events = new EventEmitter();

log.variables.processType = "express-app"
log.transports.console.format = '{h}:{i}:{s}.{ms} > [{processType}] {text}';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{processType}] {text}'

export const CascReadyEvent = 'cache-integrity-ready';

let cascReady = false;
export const cascLoaded = async () => {
    return new Promise<void>(res => {
        // Cache integrity already available.
        if (cascReady)
            return res();

        events.once(CascReadyEvent, res);
    });
};

let cascStorage: CASCLocal;
process.parentPort.on('message', (e) => {
    const msg = e.data;
    if (isSendWoWMessage(msg)) {
        cascStorage = new CASCLocal(msg.data, LocaleFlag.enUS);
        log.info(`Initializing CASC storage for path: `, msg.data);
        cascStorage.init(constants.BUILDINFO).then(() => {
            cascStorage.load(0).then(() => {
                log.info(`CASC storage initialized!`);
                cascReady = true;
                events.emit(CascReadyEvent);
            });
        })
    }
})
const app = express();
app.use(cors({
    origin: "*",
    allowedHeaders: "*",
    methods: "*",
}))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/zam', proxy("wow.zamimg.com", {
    https: true,
    userResHeaderDecorator: function (headers, userReq, userRes, proxyReq, proxyRes) {
        headers["access-control-allow-origin"] = "*"
        return headers;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        proxyReqOpts.headers.origin = "https://www.wowhead.com"
        proxyReqOpts.headers.referer = "https://www.wowhead.com";
        return proxyReqOpts;
    },
    filter: function (req, res) {
        const armorRegex = /live\/meta\/armor\/\d+\/(\d+)/
        const armorMatchResult = armorRegex.exec(req.path);
        if (armorMatchResult) {
            if (parseInt(armorMatchResult[1]) >= 900000) {
                return false;
            }
        }

        const weaponRegex = /live\/meta\/item\/(\d+)/
        const weaponMatchResult = weaponRegex.exec(req.path);
        if (weaponMatchResult) {
            if (parseInt(weaponMatchResult[1]) >= 900000) {
                return false;
            }
        }

        const mo3Regex = /live\/mo3\/(\d+).mo3/
        const mo3MatchResult = mo3Regex.exec(req.path);
        if (mo3MatchResult) {
            return false;
        }

        const boneRegex = /live\/bone\/(\d+).bone/
        const boneMatchResult = boneRegex.exec(req.path);
        if (boneMatchResult) {
            return false;
        }

        const textureRegex = /live\/textures\/(\d+).webp/
        const textureMatchResult = textureRegex.exec(req.path);
        if (textureMatchResult) {
            if (parseInt(textureMatchResult[1]) >= 6000000) {
                return false;
            }
        }
        return req.method === 'GET';
    }
}))

app.use(express.json({
    limit: "5mb"
}));
let itemData: ZamItemData;
let imgs: { [key: string]: string } = {};
app.post('/customItem', (req: express.Request<{}, {}, ZamItemData>, res) => {
    let idStr = "9";
    for (let i = 0; i < 5; i++) {
        idStr += Math.floor(Math.random() * 10);
    }
    const id = parseInt(idStr);
    itemData = req.body;
    // Free unused images
    const usedImgs = []
    for (const sectionId in itemData.TextureFiles) {
        for (const texture of itemData.TextureFiles[sectionId]) {
            if (texture.FileDataId > 6000000) {
                usedImgs.push(texture.FileDataId);
            }
        }
    }
    if (itemData.Textures && itemData.Textures["2"] && itemData.Textures["2"] > 6000000) {
        usedImgs.push(itemData.Textures["2"]);
    }
    if (itemData.Textures2 && itemData.Textures2["2"] && itemData.Textures2["2"] > 6000000) {
        usedImgs.push(itemData.Textures2["2"]);
    }
    for (const key in imgs) {
        if (usedImgs.indexOf(parseInt(key, 10)) === -1) {
            delete imgs[key];
        }
    }

    res.send(JSON.stringify({
        Id: id
    }))
})
interface AddImageRequest {
    imgData: string,
    id?: number
}

app.post('/addImage', (req: express.Request<{}, {}, AddImageRequest>, res) => {
    let idStr: string;
    if (!req.body.id || req.body.id < 6000000) {
        idStr = "6";
        for (let i = 0; i < 6; i++) {
            idStr += Math.floor(Math.random() * 10);
        }
    } else {
        idStr = req.body.id.toString();
    }
    imgs[idStr] = req.body.imgData;

    const id = parseInt(idStr);
    res.send(JSON.stringify({
        Id: id
    }))
})
app.get('/image/:imgId', (req, res) => {
    log.debug("Received request for image file:", req.params.imgId);
    log.debug(JSON.stringify(imgs));
    var data = imgs[req.params.imgId];
    if (!data) {
        res.writeHead(404);
        res.end();
    } else {
        var img = Buffer.from(data, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/webp',
            "content-length": img.length
        });
        res.end(img);
    }
})


app.get("/zam/modelviewer/live/meta/armor/*", (req, res) => {
    res.send(JSON.stringify(itemData));
});
app.get("/zam/modelviewer/live/meta/item/*", (req, res) => {
    res.send(JSON.stringify(itemData));
});
app.get("/zam/modelviewer/live/bone/:bonefile", async (req, res) => {
    const fileId = parseInt(req.params.bonefile.split('.').shift(), 10);
    await cascLoaded();
    
    log.info('Processing request for BONE fileId: ', fileId)
    var file = BONEFile.deserialize(await cascStorage.getFile(fileId));
    var output = file.toWHOutput();
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': output.byteLength
    })
    res.end(output._buf);
})
app.get("/zam/modelviewer/live/mo3/:mo3file", async (req, res) => {
    const fileId = parseInt(req.params.mo3file.split('.').shift(), 10);
    await cascLoaded();
    
    log.info('Processing request for MO3 fileId: ', fileId)

    const m2File = new M2File();
    m2File.deserialize(await cascStorage.getFile(fileId));
    await m2File.loadSkins(cascStorage);
    await m2File.loadSkeleton(cascStorage);
    await m2File.loadAnims(cascStorage);
    const mo3File = MO3Converter.fromM2(m2File).serializeToBuffer();

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': mo3File.byteLength
    })
    res.end(mo3File._buf);
})
app.get("/zam/modelviewer/live/textures/:imgFile", (req, res) => {
    const index = req.params.imgFile.split('.').shift();
    const data = imgs[index];
    if (!data) {
        res.writeHead(404);
        res.end();
    } else {
        var img = Buffer.from(data, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/webp',
            "content-length": img.length
        });
        res.end(img);
    }
});
app.use('/', (req, res) => {
    res.send('OK');
})

const server = http.createServer(app);

function shutdown() {
    log.info("Shutting down Express server...");
    server.close();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(0, 'localhost');
server.on("listening", () => {
    const port = (server.address() as AddressInfo).port;
    log.info(`Listening on: ${(server.address() as AddressInfo).port}`);
    process.parentPort.postMessage({ type: ExpressPortInfoType, data: port });
});
server.on("close", () => log.info("Express server closed."));
