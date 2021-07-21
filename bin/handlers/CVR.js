"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCVR = void 0;
function handleCVR(data) {
    this.emit("versionData", undefined, {
        recommendedVersion: data[2],
        minVersion: data[4],
        downloadUrl: data[5],
        infoUrl: data[6]
    });
}
exports.handleCVR = handleCVR;
;
//# sourceMappingURL=CVR.js.map