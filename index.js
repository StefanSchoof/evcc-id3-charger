const api = require('npm-vwconnectapi');
main();
async function main() {
    switch (process.argv[2]) {
        case "enable":
            await enable(process.argv[3]);
            break;

        case "enabled":
            await enabled();
            break;

        default:
            await status();
            break;
    }
    process.exit(0);
}

async function setUp() {
    const vwConn = new api.VwWeConnect();
    // vwConn.setLogLevel("INFO"); // optional, ERROR (default), INFO or DEBUG
    vwConn.setCredentials(process.env.mail, process.env.password);
    vwConn.setConfig("id");
    await vwConn.getData()
    vwConn.setActiveVin(process.env.vin);
    return vwConn;
}

async function enabled() {
    const vwConn = await setUp();
    console.log(vwChargingStateToState(vwConn) === "C");
}

async function enable(enable) {
    const vwConn = await setUp();
    if (enable === "true") {
        await vwConn.startCharging();
    }
    else {
        await vwConn.stopCharging();
    }
}

async function status() {
    const vwConn = await setUp()
    console.log(vwChargingStateToState(vwConn));
}

function vwChargingStateToState(vwConn) {
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
