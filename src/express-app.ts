import log from "electron-log/node"
import express from "express";
import proxy from "express-http-proxy";
import http from "http";
import cors from "cors"

// TODO: FIND RANDOM AVAILABLE PORT
import { expressPort } from "../package.json";

const app = express();
app.use(cors({
    origin: "*",
    allowedHeaders: "*",
    methods: "*",
}))
app.set("port", expressPort)
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
    log.info("[EXPRESS] Shutting down Express server...");
    server.close();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(parseInt(expressPort), 'localhost');
server.on("listening", () => log.info(`[EXPRESS] Listening on: ${expressPort}`));
server.on("close", () => log.info("[EXPRESS] Express server closed."));