import { MSNPBaseClass } from "../baseclass.js"

export interface MSNPInvitation {
        sessionId: string,
        auth: {
            authType: "CKI",
            authTicket: string,
            sbServerAddr: string,
            sbServerPort: number
        },
        inviter: {
            passport: string,
            name: string
        }
}

export class SwitchboardConnection extends MSNPBaseClass {
    invitation: MSNPInvitation;
    ip: string;
    port: number;
    trid = 0
    roster = []
    constructor(mypassport,invitation) {
        super(invitation.auth.sbServerAddr,invitation.auth.sbServerPort)
        this.invitation = invitation
        this.ip = invitation.auth.sbServerAddr
        this.port = invitation.auth.sbServerPort
        this.conn.on("connect",() => {
            this.sendCommand("ANS",mypassport,invitation.auth.authTicket,invitation.sessionId)
        })
        

    }
    runCommand(split) {
        try {
            var hndlr = require("./handlers/" + split[0] + ".js").bind(this)
            hndlr(split)
        } catch(e) {
            console.error("couldn't parse message",split,e)
        }
    }

   


}