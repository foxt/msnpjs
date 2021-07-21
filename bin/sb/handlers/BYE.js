"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBYE = void 0;
function handleBYE(data) {
    if (!this.roster) {
        this.roster = [];
    }
    this.roster = this.roster.filter((a) => data[1] != a.passport);
    this.emit("bye", undefined, data[1], this.roster);
}
exports.handleBYE = handleBYE;
;
//# sourceMappingURL=BYE.js.map