import { StringDecoder } from "node:string_decoder";
import { MSNPBaseClass } from "./baseclass.js";
import { MSNPInvitation } from "./sb/index.js";
import { authenticate } from "./tweener.js";

type PRESENCE = "NLN" | "BSY" | "IDL" | "BRB" | "AWY" | "PHN" | "LUN" | "HDN";

export const OUT_REASONS = {
    OTH: "another client has logged in with the same account and the server does not support multiple clients",
    SSD: "the server is going down for maintainance"
};

export declare interface MSNPConnection extends MSNPBaseClass {
    on(event: string, callback: Function):this 
    /**
    * We have disconnected from the server.
    * @event
    */
    on(event: "disconnected", callback: () => any): this,
    /**
    * We have had an error on the socket.
    * @event
    */
    on(event: "socketError", callback: (err: Error) => any): this,
    /**
    * Your request to change presence was recieved successfully by the server.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/CHG
    */
    on(event: "selfPresenceChanged", callback: (newPresence: PRESENCE) => any): this,
    /**
    * The server has responded with the recommended version of the client to use, the minimum safe version as well as 2 URLs, one a link to the download page for the updated version and one to a page with information about the updated version. If the client is unrecognised by the server, the recommended version is 1.0.0000 and the minimum version is the version number sent by the client in the initial CVR.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/CVR
    */
    on(event: "versionData", callback: (data: {
        recommendedVersion: string,
        minVersion: string,
        downloadUrl: string,
        infoUrl: string
    }) => any): this,
    /**
    * The server would like us to leave.
    * Where reason is OTH if the user has logged on from another location (if the service does not support multiple simultaneous connections) or SSD if the notification server is being taking down for maintenance, in which case the client should reconnect to a dispatch server to get an XFR to another notification server. 
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/OUT
    */
    on(event: "loggingOut", callback: (reason: "OTH" | "SSD") => any): this,
    /**
    * Recieved a pong after a ping.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/QNG
    */
    on(event: "raw_QNG", callback: () => any): this,
    /**
    * The RNG command is sent to you from the Notification Server whenever you have been invited into a switchboard by another principal using the CAL command. 
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/RNG
    */
    on(event: "invitationRecieved", callback: (invitation: MSNPInvitation) => any): this,
    /**
    * The server is requesting that you authenticate with Tweener.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/USR
    */
    on(event: "twnRequest", callback: (challenge: string) => any): this,
    /**
    * The server has authenticated you successfully
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/USR
    */
    on(event: "authenticated", callback: (accountDetails: {
        passport: string, displayName: string, verified: boolean, kidsPassport: boolean
    }) => any): this,
    /**
    * We have handshaked with the server. Double check that the MSNP version was as expected.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/VER
    */
    on(event: "handshake", callback: (expectedMSNPVersion: boolean, MSNPVersion: string) => any): this,
}

interface MSNPConnectionOptions {
    /**
    * The location of the Tweener Nexus authentication server
    * @default https://m1.escargot.log1p.xyz/nexus-mock
    */
    tweenerNexus?:string,
    /**
    * The IP of the MSNP server
    * @default m1.escargot.log1p.xyz
    */
    ip?:string,
    /**
    * The port that the MSNP server is running on
    * @default 1863
    */
    port?: number
    /**
    * Protocol version that we will report to the server.
    * Don't change unless you know what you're doing.
    * @default MSNP8
    */
    proto?: string
    /**
    * Capabilities that we will report to the server.
    * Don't change unless you know what you're doing.
    * @default 0x0
    */
    capabilities?: number
}
export class MSNPConnection extends MSNPBaseClass {
    protocolVersion:string;
    tweenerNexus:string;
    capabilities:number;
    passport:string;
    
    constructor(passport:string, opts?: MSNPConnectionOptions) {
        opts = opts || {};
        super(opts.ip || "m1.escargot.log1p.xyz", opts.port || 1863);
        this.protocolVersion = opts.proto || "MSNP8";
        this.tweenerNexus = opts.tweenerNexus || "https://m1.escargot.log1p.xyz/nexus-mock";
        this.capabilities = opts.capabilities || 0x20;
        this.passport = passport;
        if (!passport) { throw new Error("must provide a passport!"); }
        
        this.on("raw_CHG",(data: string[]) => this.emit("selfPresenceChanged", data[2]))
        this.on("raw_CVR",(data: string[]) => this.emit("versionData", {
            recommendedVersion: data[2],
            minVersion: data[4],
            downloadUrl: data[5],
            infoUrl: data[6]
        }));
        this.on("raw_OUT",(data: string[]) => {
            this.emit("loggingOut", data[0]);
            this.conn.end();
        })
        this.on("raw_RNG", (data: string[]) => {
            let addr = data[2].split(":");
            this.emit("invitationRecieved", {
                sessionId: data[1],
                auth: {
                    authType: data[3],
                    authTicket: data[4],
                    sbServerAddr: addr[0],
                    sbServerPort: addr[1]
                },
                inviter: {
                    passport: data[5],
                    name: data[6]
                }
                
            });
        })
        this.on("raw_USR", (data: string[]) => {
            if (data[2] == "TWN") this.emit("twnRequest", data[4]);
            if (data[2] == "OK")  this.emit("authenticated", {
                passport: data[3], displayName: decodeURIComponent(data[4]), verified: data[5] == "1", kidsPassport: data[6] == "1"
            });
        })
        this.on("raw_VER", (data: string[]) => this.emit("handshake", data[2] == this.protocolVersion, data[2]))
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
        this.sendCommand("CVR", "0x0409", process.platform, process.version, process.arch, "msnpjs", version, "MSMSGS", this.passport);
        return this.waitFor("versionData");
    }
    async initAuthentication() {
        this.sendCommand("USR", "TWN", "I", this.passport);
        return (await this.waitFor("twnRequest"))[0];
    }
    logout() {
        this.conn.write("OUT\r\n");
        this.conn.end();
    }
    ping() {
        this.conn.write("PNG\r\n");
        return this.waitFor("raw_QNG");
    }
    
    // AUTHENTICATION
    finishAuthentication(ticket:string) {
        this.sendCommand("USR", "TWN", "S", ticket);
        return this.waitFor("authenticated");
    }
    async login(password: string) {
        await this.handshake();
        await this.sendCurrentVer();
        let challenge = await this.initAuthentication();
        let authTicket = await authenticate(this.tweenerNexus, this.passport, password, challenge);
        return this.finishAuthentication(authTicket);
    }
    
    // PRESENCE
    setPresence(code: PRESENCE): Promise<string[]> {
        this.sendCommand("CHG", code, this.capabilities.toString());
        return this.waitFor("selfPresenceChanged");
    }
}
