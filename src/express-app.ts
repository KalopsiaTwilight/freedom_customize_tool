import express from "express";
import proxy from "express-http-proxy";
import http from "http";
import { expressPort } from "../package.json";

const app = express();
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
        // TODO: Filter out custom items
        return req.method === 'GET';
    }
}))
app.use('/', (req, res) => {
    res.send('OK');
})

const server = http.createServer(app);

function shutdown() {
    console.log("Shutting down Express server...");
    server.close();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(expressPort);
server.on("listening", () => console.log(`Listening on: ${expressPort}`));
server.on("close", () => console.log("Express server closed."));

console.log("I am executing!");