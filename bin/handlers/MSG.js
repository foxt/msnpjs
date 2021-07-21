"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMSG = void 0;
const parseMsg_1 = require("../parseMsg");
function handleMSG(data) {
    this.emit("msgRecieved", undefined, parseMsg_1.parseMsg(data));
}
exports.handleMSG = handleMSG;
;
//# sourceMappingURL=MSG.js.map