
const os = require("os")
const net = require("net")
const tweener = require("./tweener")
const SwitchboardConnection = require("./sb")
const MSNPBaseClass = require("./baseclass")

const VALID_PRESENCES = [
    "NLN", // Available
    "BSY", // Busy
    "IDL", // Idle
    "BRB", // BRB
    "AWY", // Away
    "PHN", // On the phone
    "LUN", // Out to lunch
    "HDN"  // Invisible
]

class MSNPConnection extends MSNPBaseClass {
    constructor(passport,opts) {
        opts = opts || {}
        super( opts.ip || "m1.escargot.log1p.xyz",opts.port || 1863)
        this.protocolVersion = opts.proto || "MSNP8"
        this.tweenerNexus = opts.tweenerNexus || "https://m1.escargot.log1p.xyz/nexus-mock"
        this.capabilities = opts.capabilities || 0x20
        this.passport = passport
        this.trid = 0
        if (!passport) { throw new Error("must provide a passport!")}
        
        
    }

    runCommand(split) {
        try {
            var hndlr = require("./handlers/" + split[0] + ".js").bind(this)
            hndlr(split)
        } catch(e) {
            console.error("couldn't parse message",split,e)
        }
    }

    // HANDSHAKE
    handshake() {
        this.sendCommand("VER",this.protocolVersion + " CVR0")
        return this.waitFor("handshake")
    }
    sendCurrentVer() {
        this.sendCommand("CVR","0x0409",os.platform(),os.release(),os.arch(),"msnpjs",require("./package.json").version,"MSMSGS",this.passport)
        return this.waitFor("versionData")
    }
    initAuthentication() {
        this.sendCommand("USR","TWN","I",this.passport)
        return this.waitFor("twnRequest")
    }
    logout() {
        this.conn.write("OUT\r\n")
        this.conn.end()
    }
    ping() {
        this.conn.write("PNG\r\n")
        return this.waitFor("pong")
    }

    // AUTHENTICATION
    finishAuthentication(ticket) {
        this.sendCommand("USR","TWN","S",ticket)
        return this.waitFor("authenticated")
    }
    async login(password) {
        await this.handshake()
        await this.sendCurrentVer()
        var challenge = await this.initAuthentication()
        var authTicket = await tweener.authenticate(this.tweenerNexus,this.passport,password,challenge);
        return this.finishAuthentication(authTicket)
    }

    // PRESENCE
    setPresence(code) {
        if (!VALID_PRESENCES.includes(code)) { throw new Error("Invalid presence, must be one of " + VALID_PRESENCES.join())}
        this.sendCommand("CHG",code,this.capabilities)
        return this.waitFor("selfPresenceChanged")
    }
}

module.exports = MSNPConnection
module.exports.Tweener = tweener
module.exports.Switchboard = SwitchboardConnection