const parseMsg = require("../parseMsg")
module.exports = function(data) {
    this.emit("msgRecieved",undefined,parseMsg(data))
}