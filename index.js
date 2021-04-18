const express = require('express');
const bodyParser = require('body-parser');
const api = require('npm-vwconnectapi');

const app = express();
function defaultContentTypeMiddleware(req, res, next) {
    req.headers['content-type'] = req.headers['content-type'] || 'text/plain';
    next();
}

app.use(defaultContentTypeMiddleware);
app.use(bodyParser.text());
let statusRes;

setInterval(async () => {
    console.log("start status schedule");
    const vwConn = setUp();
    statusRes = await status(vwConn);
    console.log(`finish status schedule: ${statusRes}`);
}, 60 * 1000);

app.get("/status", async (_, res) => {
    console.log(`status: ${statusRes}`)
    res.send(statusRes);
});

app.get("/enabled", async (_, res) => {
    const enabledRes = enabled();
    console.log(`enabled: ${enabledRes}`)
    res.send(enabledRes);
});

app.post("/enable",
    async (req, res) => {
        const vwConn = setUp();
        console.log(`!!!!!!start enable ${req.body}`);
        await enable(vwConn, req.body);
        res.send("OK");
    }
);

app.post("/maxcurrent",
    async (req, res) => {
        console.log(`start maxcurrent ${req.body}`);
        res.send("Not Implemented");
    }
);

status(setUp()).then(res => {
    statusRes = res;
    app.listen(8080);
    console.log("Listen on Port 8080");
});

function setUp() {
    const vwConn = new api.VwWeConnect();
    vwConn.setCredentials(process.env.mail, process.env.password);
    vwConn.setConfig("id");

    return vwConn;
}

function enabled() {
    return statusRes === "C";
}

async function enable(vwConn, enable) {
    await vwConn.getData();
    vwConn.setActiveVin(process.env.vin);
    if (enable === "true") {
        console.log("startCharging");
        await vwConn.startCharging();
    }
    else {
        console.log("stopCharging");
        await vwConn.stopCharging();
    }
}

async function status(vwConn) {
    await vwConn.getData();
    chargingState = vwConn.idData.data.chargingStatus.chargingState;
    plugConnectionState = vwConn.idData.data.plugStatus.plugConnectionState;
    if (plugConnectionState === "disconnected") {
        return "A"
    }
    switch (chargingState) {
        case "readyForCharging":
            return "B";
        case "charging":
            return "C";

        default:
            return "F";
    }
}
