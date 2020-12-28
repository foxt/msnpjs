const { EventEmitter } = require("events")
const os = require("os")
const net = require("net")
const tweener = require("./tweener")
const SwitchboardConnection = require("./sb")

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

class MSNPConnection extends EventEmitter {
    constructor(passport,opts) {
        super()
        opts = opts || {}
        this.protocolVersion = opts.proto || "MSNP8"
        this.port = opts.port || 1863
        this.ip = opts.ip || "m1.escargot.log1p.xyz"
        this.tweenerNexus = opts.tweenerNexus || "https://m1.escargot.log1p.xyz/nexus-mock"
        
        this.passport = passport
        this.trid = 0
        if (!passport) { throw new Error("must provide a passport!")}
        this.conn = net.createConnection({host: this.ip, port: this.port})
        this.conn.on("close",() => {this.emit("disconnected")})
        this.conn.on("error",(e) => {this.emit("socketError",e)})
        this.conn.on("data",this.parseData.bind(this))
        
    }
    dbg(...args) {
        if (this.debug || true) {
            console.debug(...args)
        }
    }
    msgBytesRecieved = 0
    msgBytesRequired = 0
    msgBytes = ""
    msgRecieving = false
    parseData(data) {
        var string = data.toString()
        this.dbg("data in",string)
        if (!this.msgRecieving && string.startsWith("MSG")) {
            this.msgBytesRequired = parseInt(string.split("\r\n")[0].split(" ")[3])
            this.msgBytes = string
            this.msgBytesRecieved = string.length
            this.msgRecieving = true
            return
        }
        if (this.msgRecieving) {
            this.dbg("got " + this.msgBytesRecieved + "/" + this.msgBytesRequired)
            this.msgBytes += string
            this.msgBytesRecieved += string.length
            if (this.msgBytesRecieved >= this.msgBytesRequired) {
                this.msgRecieving = false
                string = this.msgBytes
            }else {
                return
            }
        }
        
        var split = string.trim().split(" ")
        
        try {
            var hndlr = require("./handlers/" + split[0] + ".js").bind(this)
            hndlr(split)
        } catch(e) {
            console.error("couldn't parse message",split,e)
        }
    }
    waitFor(eventName) {
        return new Promise(function(a,r) {
            this.once(eventName,(err,data) => {
                if (err) {
                    this.dbg(err)
                    return r(err);
                } 
                return a(data) 
            })
        }.bind(this))
    }
    sendCommand(commandName, ...args) {
        this.trid += 1;
        this.dbg("data out",[commandName,this.trid,...args].join(" ") + "\r\n")
        this.conn.write([commandName,this.trid,...args].join(" ") + "\r\n")   
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
        this.sendCommand("CHG",code,"0")
        return this.waitFor("selfPresenceChanged")
    }
}

module.exports = MSNPConnection
module.exports.Tweener = tweener
module.exports.Switchboard = SwitchboardConnection