import { parseMsg } from "../../parseMsg";

let chunks = {};

export function handleMSG(data) {
    let m = parseMsg(data);

    /** if (m.headers["Chunks"]) {
        return this.dbg("start chunking with ",m)
    }
    this.dbg(m.headers)
    if (m.headers["Chunk"]) {
        return this.dbg("it's a chunk")
    }**/
    this.dbg("WE GOT A MESAG", m);
    this.emit("msgRecieved", undefined, m);
};