
export function handleBYE(data) {
    if (!this.roster) { this.roster = []; }
    this.roster = this.roster.filter((a) => data[1] != a.passport);
    this.emit("bye", undefined, data[1], this.roster);
};