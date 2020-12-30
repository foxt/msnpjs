const msgParser = require("../../parseMsg")

var chunks = {}

module.exports = function(data) {
    var m = msgParser(data)

    /**if (m.headers["Chunks"]) {
        return this.dbg("start chunking with ",m)
    }
    this.dbg(m.headers)
    if (m.headers["Chunk"]) {
        return this.dbg("it's a chunk")
    }**/
    this.dbg("WE GOT A MESAG",m)
    this.emit("msgRecieved",undefined,m)

}