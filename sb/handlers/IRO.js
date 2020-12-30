
module.exports = function(data) {
    if (!this.roster) {this.roster = []}
    var d = {
        passport: data[4],
        name: data[5].split("\r\n")[0],
        //id: data[6],
        ordinal: parseInt(data[2])
    }
    this.roster.push(d)
    d.rosterSize = parseInt(data[3])
    this.emit("rosterProgress",undefined,d)
    this.dbg("Roster added",d)
    if (parseInt(data[2]) >= parseInt(data[3])) {
        this.dbg("Roster complete",this.roster)
        this.emit("rosterComplete",undefined,this.roster)
    }
}