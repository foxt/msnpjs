
module.exports = function(data) {
    this.emit("authenticated",data[2])
}