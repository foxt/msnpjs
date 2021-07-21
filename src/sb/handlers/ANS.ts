
export function handleANS(data) {
    this.emit("authenticated", data[2]);
};