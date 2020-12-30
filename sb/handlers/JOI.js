
module.exports = function(data) {
    if (!this.roster) {this.roster = []}
    this.roster.push({
        passport: data[1],
        name: data[2],
    })
    this.emit("join",undefined,{
        passport: data[1],
        name: data[2],
    },this.roster)
}