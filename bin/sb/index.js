"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchboardConnection = void 0;
const baseclass_js_1 = require("../baseclass.js");
class SwitchboardConnection extends baseclass_js_1.MSNPBaseClass {
    constructor(mypassport, invitation) {
        super(invitation.auth.sbServerAddr, invitation.auth.sbServerPort);
        this.trid = 0;
        this.roster = [];
        this.invitation = invitation;
        this.ip = invitation.auth.sbServerAddr;
        this.port = invitation.auth.sbServerPort;
        this.conn.on("connect", () => {
            this.sendCommand("ANS", mypassport, invitation.auth.authTicket, invitation.sessionId);
        });
    }
    runCommand(split) {
        try {
            var hndlr = require("./handlers/" + split[0] + ".js").bind(this);
            hndlr(split);
        }
        catch (e) {
            console.error("couldn't parse message", split, e);
        }
    }
}
exports.SwitchboardConnection = SwitchboardConnection;
//# sourceMappingURL=index.js.map