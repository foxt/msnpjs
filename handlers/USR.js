module.exports = function(data) {
    if (data[2] == "TWN") {
        this.emit("twnRequest",undefined,data[4])
    }
    if (data[2] == "OK") {
        this.emit("authenticated",undefined,{
            passport: data[3], displayName: decodeURIComponent(data[4]), verified: data[5] == "1"
        })
    }
}