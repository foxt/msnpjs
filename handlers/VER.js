
module.exports = function(data) {
    this.emit("handshake",data[2] == this.protocolVersion ? false : "Invalid protocol version",data[2])
}