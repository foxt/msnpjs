"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMSG = void 0;
const parseMsg_1 = require("../../parseMsg");
let chunks = {};
function handleMSG(data) {
    let m = parseMsg_1.parseMsg(data);
    /** if (m.headers["Chunks"]) {
        return this.dbg("start chunking with ",m)
    }
    this.dbg(m.headers)
    if (m.headers["Chunk"]) {
        return this.dbg("it's a chunk")
    }**/
    this.dbg("WE GOT A MESAG", m);
    this.emit("msgRecieved", undefined, m);
}
exports.handleMSG = handleMSG;
;
//# sourceMappingURL=MSG.js.map