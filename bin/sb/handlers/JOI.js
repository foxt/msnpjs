"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJOI = void 0;
function handleJOI(data) {
    if (!this.roster) {
        this.roster = [];
    }
    this.roster.push({
        passport: data[1],
        name: data[2]
    });
    this.emit("join", undefined, {
        passport: data[1],
        name: data[2]
    }, this.roster);
}
exports.handleJOI = handleJOI;
;
//# sourceMappingURL=JOI.js.map