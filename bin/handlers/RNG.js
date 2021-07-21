"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRNG = void 0;
function handleRNG(data) {
    let addr = data[2].split(":");
    this.emit("invitationRecieved", undefined, {
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
}
exports.handleRNG = handleRNG;
;
//# sourceMappingURL=RNG.js.map