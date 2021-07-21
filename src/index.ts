import { MSNPBaseClass } from "./baseclass.js";
import { authenticate } from "./tweener.js";

const VALID_PRESENCES = [
    "NLN", // Available
    "BSY", // Busy
    "IDL", // Idle
    "BRB", // BRB
    "AWY", // Away
    "PHN", // On the phone
    "LUN", // Out to lunch
    "HDN" // Invisible
];

export class MSNPConnection extends MSNPBaseClass {
    protocolVersion:string;
    tweenerNexus:string;
    capabilities:number;
    passport:string;
    trid: number
    constructor(passport, opts) {
        opts = opts || {};
        super(opts.ip || "m1.escargot.log1p.xyz", opts.port || 1863);
        this.protocolVersion = opts.proto || "MSNP8";
        this.tweenerNexus = opts.tweenerNexus || "https://m1.escargot.log1p.xyz/nexus-mock";
        this.capabilities = opts.capabilities || 0x20;
        this.passport = passport;
        if (!passport) { throw new Error("must provide a passport!"); }


        this.on("raw_CHG",(data) => this.emit("selfPresenceChanged", undefined, data[2]))
        
    }


    // HANDSHAKE
    handshake() {
        this.sendCommand("VER", this.protocolVersion + " CVR0");
        return this.waitFor("handshake");
    }
    sendCurrentVer() {
        let version = "0.0.0";
        try {
            version = require("../package.json").version;
        } catch (e) {}
        this.sendCommand("CVR", "0x0409", process.platform, process.release, process.arch, "msnpjs", version, "MSMSGS", this.passport);
        return this.waitFor("versionData");
    }
    initAuthentication() {
        this.sendCommand("USR", "TWN", "I", this.passport);
        return this.waitFor("twnRequest");
    }
    logout() {
        this.conn.write("OUT\r\n");
        this.conn.end();
    }
    ping() {
        this.conn.write("PNG\r\n");
        return this.waitFor("pong");
    }

    // AUTHENTICATION
    finishAuthentication(ticket) {
        this.sendCommand("USR", "TWN", "S", ticket);
        return this.waitFor("authenticated");
    }
    async login(password) {
        await this.handshake();
        await this.sendCurrentVer();
        let challenge = await this.initAuthentication();
        let authTicket = await authenticate(this.tweenerNexus, this.passport, password, challenge);
        return this.finishAuthentication(authTicket);
    }

    // PRESENCE
    setPresence(code) {
        if (!VALID_PRESENCES.includes(code)) { throw new Error("Invalid presence, must be one of " + VALID_PRESENCES.join()); }
        this.sendCommand("CHG", code, this.capabilities);
        return this.waitFor("selfPresenceChanged");
    }
}
