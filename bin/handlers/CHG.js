"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCHG = void 0;
function handleCHG(data) {
    this.emit("selfPresenceChanged", undefined, data[2]);
}
exports.handleCHG = handleCHG;
;
//# sourceMappingURL=CHG.js.map