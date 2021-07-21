export function handleUSR(data) {
    if (data[2] == "TWN") this.emit("twnRequest", data[4]);
    if (data[2] == "OK")  this.emit("authenticated", {
            passport: data[3], displayName: decodeURIComponent(data[4]), verified: data[5] == "1"
        });
};