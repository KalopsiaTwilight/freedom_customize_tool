import log from "electron-log/node"
import express from "express";
import proxy from "express-http-proxy";
import http from "http";
import cors from "cors"
import { AddressInfo } from "node:net"

log.variables.processType = "express-app"
log.transports.console.format = '{h}:{i}:{s}.{ms} > [{processType}] {text}';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{processType}] {text}'

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
    userResHeaderDecorator: function(headers, userReq, userRes, proxyReq, proxyRes) {
        headers["access-control-allow-origin"] = "*"
        return headers;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
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

app.use(express.json());
let itemData: ZamItemData;
let imgs: { [key:string]: string } = { };
app.post('/customItem', (req: express.Request<{}, {}, ZamItemData>, res) => {
    let idStr = "9";
    for (let i = 0; i < 5;i++)
    {
        idStr += Math.floor(Math.random() * 10);
    }
    const id = parseInt(idStr);
    itemData = req.body;
    // Free unused images
    const usedImgs = []
    for(const sectionId in itemData.TextureFiles) {
        for(const texture of itemData.TextureFiles[sectionId]) {
            if (texture.FileDataId > 6000000) {
                usedImgs.push(texture.FileDataId);
            }
        }
    }
    if (itemData.Textures && itemData.Textures["2"] && itemData.Textures["2"] > 6000000) {
        usedImgs.push(itemData.Textures["2"]);
    }
    if (itemData.Textures && itemData.Textures2["2"] && itemData.Textures2["2"] > 6000000) {
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
        for (let i = 0; i < 6;i++)
        {
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


app.get("/zam/modelviewer/live/meta/armor/*", (req,res) => {
    res.send(JSON.stringify(itemData));
});
app.get("/zam/modelviewer/live/meta/item/*", (req,res) => {
    res.send(JSON.stringify(itemData));
});
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
    process.parentPort.postMessage(port);
});
server.on("close", () => log.info("Express server closed."));