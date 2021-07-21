"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIRO = void 0;
function handleIRO(data) {
    if (!this.roster) {
        this.roster = [];
    }
    let d = {
        passport: data[4],
        name: data[5].split("\r\n")[0],
        // id: data[6],
        ordinal: parseInt(data[2]),
        rosterSize: parseInt(data[3])
    };
    this.roster.push(d);
    this.emit("rosterProgress", undefined, d);
    this.dbg("Roster added", d);
    if (parseInt(data[2]) >= parseInt(data[3])) {
        this.dbg("Roster complete", this.roster);
        this.emit("rosterComplete", undefined, this.roster);
    }
}
exports.handleIRO = handleIRO;
;
//# sourceMappingURL=IRO.js.map