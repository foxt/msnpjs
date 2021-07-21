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

export interface Participant {
    passport: string, name: string, 
    /**
     * Capabilities is not guaranteed on <= MSNP12.
     */
    capabilities?: number,
}
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
    * This is sent to you when a user you call connects and joins your switchboard session.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/JOI
    */
    on(event: "join", callback: (participant: Participant,roster: Participant[]) => any): this,
    /**
    * This is sent to you when you have successfully authenticated to the switchboard.
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/ANS
    */
    on(event: "authenticated", callback: () => any): this,
    /**
    * This is sent to your client when a contact has left the conversation
    * @event
    * @see https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/BYE
    */
     on(event: "bye", callback: () => (passport: string,roster: Participant[]) => any): this,
}
export class SwitchboardConnection extends MSNPBaseClass {
    invitation: MSNPInvitation;
    ip: string;
    port: number;
    trid = 0
    roster: Participant[] = []
    constructor(mypassport:string,invitation: MSNPInvitation) {
        super(invitation.auth.sbServerAddr,invitation.auth.sbServerPort)
        this.invitation = invitation
        this.ip = invitation.auth.sbServerAddr
        this.port = invitation.auth.sbServerPort
        this.conn.on("connect",() => {
            this.sendCommand("ANS",mypassport,invitation.auth.authTicket,invitation.sessionId)
        })

        this.on("raw_JOI",(data) => {
            if (!this.roster) { this.roster = []; }
            var participant:Participant = {
                passport: data[1],
                name: data[2],
            }
            if (data[3]) participant.capabilities = parseInt(data[3])
            this.roster.push(participant);
            this.emit("join", participant, this.roster);
        })
        this.on("raw_ANS",(data) => this.emit("authenticated", data[2]));
        this.on("raw_BYE", (data) => {
            if (!this.roster) { this.roster = []; }
            this.roster = this.roster.filter((a) => data[1] != a.passport);
            this.emit("bye", data[1], this.roster);
        })
    }
   


}