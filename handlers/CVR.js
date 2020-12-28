
module.exports = function(data) {
    this.emit("versionData",undefined,{
        recommendedVersion: data[2],
        minVersion: data[4],
        downloadUrl: data[5],
        infoUrl: data[6]
    })
}