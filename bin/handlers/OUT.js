"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOUT = exports.OUT_REASONS = void 0;
exports.OUT_REASONS = {
    OTH: "because another client has logged in with the same account and the server does not support multiple clients",
    SSD: "because it is going down for maintainance"
};
function handleOUT(data) {
    console.log("Server has disconnected ", data[0] ? "because we asked it to" : exports.OUT_REASONS[data[0]]);
    this.emit("loggingOut", undefined, data[0]);
    this.conn.end();
}
exports.handleOUT = handleOUT;
;
//# sourceMappingURL=OUT.js.map