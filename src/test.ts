import { MSNPConnection } from "./index.js";
import { MSNPInvitation, SwitchboardConnection } from "./sb/index.js";

export const conn = new MSNPConnection("vmpmc@hotmail.com");
;(async function() {
    // conn.debug = true
    conn.on("disconnected", console.error);
    conn.on("socketError", console.error);
    conn.on("selfPresenceChanged", console.log);
    conn.on("msgRecieved", console.log);
    let auth = await conn.login(process.argv[2]);
    console.log("we authed boys", auth);
    await conn.setPresence("NLN");
    conn.on("invitationRecieved", (invitation: MSNPInvitation) => {
        console.log("ring ring!");
        let sbc = new SwitchboardConnection(conn.passport, invitation);
        sbc.debug = true;
        sbc.on("rosterComplete", console.log);
        sbc.on("msgRecieved", console.log);
        console.log(sbc);
    });
}());