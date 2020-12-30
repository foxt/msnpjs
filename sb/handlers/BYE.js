
module.exports = function(data) {
    if (!this.roster) {this.roster = []}
    this.roster = this.roster.filter(function(a) {
        return data[1] != a.passport
    })
    this.emit("bye",undefined,data[1],this.roster)
}