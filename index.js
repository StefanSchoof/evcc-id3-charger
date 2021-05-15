const express = require('express');
const bodyParser = require('body-parser');
const api = require('npm-vwconnectapi');
require('log-timestamp');

const app = express();
let enabledState = false;
let previousStatus = "Startup"

app.use(bodyParser.text());

app.get("/status", async (_, res) => {
    const vwConn = setUp();
    const statusRes = await status(vwConn);
    if (previousStatus !== statusRes) {
        console.log(`new status: ${statusRes}`);
        previousStatus = statusRes;
    }
    res.send(statusRes);
});

app.get("/enabled", async (_, res) => {
    res.send(enabledState);
});

app.post("/enable",
    async (req, res) => {
        const vwConn = setUp();
        console.log(`start enable ${req.body}`);
        enabledState = req.body === "true"
        await enable(vwConn, enabledState);
        res.send("OK");
    }
);

app.post("/maxcurrent",
    async (req, res) => {
        console.log(`start maxcurrent ${req.body}`);
        res.send("Not Implemented");
    }
);

app.listen(8080);
console.log("Listen on Port 8080");

function setUp() {
    const vwConn = new api.VwWeConnect();
    vwConn.setCredentials(process.env.mail, process.env.password);
    vwConn.setConfig("id");

    return vwConn;
}

async function enable(vwConn, enable) {
    await vwConn.getData();
    vwConn.setActiveVin(process.env.vin);
    if (enable) {
        console.log("startCharging");
        await vwConn.startCharging();
        console.log("finish startCharging");
    }
    else {
        console.log("stopCharging");
        await vwConn.stopCharging();
        console.log("finish stopCharging");
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
