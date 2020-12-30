const baseclass = require("../baseclass")


class SwitchboardConnection extends baseclass {
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

module.exports = SwitchboardConnection