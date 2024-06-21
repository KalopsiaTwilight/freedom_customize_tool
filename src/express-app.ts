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
        const matchResult = armorRegex.exec(req.path);
        if (matchResult) {
            if (parseInt(matchResult[1]) >= 900000) {
                return false;
            }
        }
        return req.method === 'GET';
    }
}))

app.use(express.json());
let itemData = {};
app.post('/customItem', (req, res) => {
    let idStr = "9";
    for (let i = 0; i < 5;i++)
    {
        idStr += Math.floor(Math.random() * 10);
    }
    const id = parseInt(idStr);
    itemData = req.body;
    res.send(JSON.stringify({
        Id: id
    }))
})
app.get("/zam/modelviewer/live/meta/armor/*", (req,res) => {
    res.send(JSON.stringify(itemData));
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