"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const index_js_1 = require("./index.js");
const index_js_2 = require("./sb/index.js");
exports.conn = new index_js_1.MSNPConnection("vmpmc@hotmail.com", {
    capabilities: 17021669
});
;
(async function () {
    // conn.debug = true
    exports.conn.on("disconnected", console.error);
    exports.conn.on("socketError", console.error);
    exports.conn.on("selfPresenceChanged", console.log);
    exports.conn.on("msgRecieved", console.log);
    let auth = await exports.conn.login(process.argv[2]);
    console.log("we authed boys", auth);
    await exports.conn.setPresence("NLN");
    exports.conn.on("invitationRecieved", (err, invitation) => {
        console.log("ring ring!");
        let sbc = new index_js_2.SwitchboardConnection(exports.conn.passport, invitation);
        sbc.debug = true;
        global.sbc = sbc;
        sbc.on("rosterComplete", console.log);
        sbc.on("msgRecieved", console.log);
        console.log(sbc);
    });
}());
//# sourceMappingURL=test.js.map