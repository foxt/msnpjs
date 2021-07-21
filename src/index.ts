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
    on(event: "socketError", callback: (Error)): this,
    /**
     * Your request to change presence was recieved successfully by the server.
     * @event
     * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/CHG
     */
    on(event: "selfPresenceChanged", callback: (PRESENCE)): this,
     /**
     * The server has responded with the recommended version of the client to use, the minimum safe version as well as 2 URLs, one a link to the download page for the updated version and one to a page with information about the updated version. If the client is unrecognised by the server, the recommended version is 1.0.0000 and the minimum version is the version number sent by the client in the initial CVR.
     * @event
     * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/CVR
     */
    on(event: "versionData", callback: ({
        recommendedVersion: string,
        minVersion: string,
        downloadUrl: string,
        infoUrl: string
    })): this,
    /**
     * The server would like us to leave.
     * Where reason is OTH if the user has logged on from another location (if the service does not support multiple simultaneous connections) or SSD if the notification server is being taking down for maintenance, in which case the client should reconnect to a dispatch server to get an XFR to another notification server. 
     * @event
     * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/OUT
     */
     on(event: "loggingOut", callback: ("OTH" | "SSD")): this,
    /**
     * Recieved a pong after a ping.
     * @event
     * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/QNG
     */
      on(event: "loggingOut", callback: ("OTH" | "SSD")): this,
    /**
     * The RNG command is sent to you from the Notification Server whenever you have been invited into a switchboard by another principal using the CAL command. 
     * @event
     * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/RNG
     */
     on(event: "invitationRecieved", callback: MSNPInvitation): this,
}
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

        this.on("raw_CHG",(data) => this.emit("selfPresenceChanged", data[2]))
        this.on("raw_CVR",(data) => this.emit("versionData", {
            recommendedVersion: data[2],
            minVersion: data[4],
            downloadUrl: data[5],
            infoUrl: data[6]
        }));
        this.on("raw_OUT",(data) => {
            this.emit("loggingOut", data[0]);
            this.conn.end();
        })
        this.on("raw_RNG", (data) => {
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
        return this.waitFor("raw_QNG");
    }

    // AUTHENTICATION
    finishAuthentication(ticket) {
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
