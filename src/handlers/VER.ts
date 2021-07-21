
export function handleVER(data) {
    this.emit("handshake", data[2] == this.protocolVersion ? false : "Invalid protocol version", data[2]);
};