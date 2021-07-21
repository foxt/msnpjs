import { parseMsg } from "../parseMsg";

export function handleMSG(data) {
    this.emit("msgRecieved", undefined, parseMsg(data));
};