"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVER = void 0;
function handleVER(data) {
    this.emit("handshake", data[2] == this.protocolVersion ? false : "Invalid protocol version", data[2]);
}
exports.handleVER = handleVER;
;
//# sourceMappingURL=VER.js.map