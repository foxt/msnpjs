import * as EventEmitter from "events"
import { createConnection, Socket } from "net"

export class MSNPBaseClass extends EventEmitter {
    conn: Socket;
    debug = true;
    trid = 0;
    constructor(ip,port) {
        super()
        this.conn = createConnection({host: ip, port: port})
        this.conn.on("close",() => {this.emit("disconnected")})
        this.conn.on("error",(e) => {this.emit("socketError",e)})
        this.conn.on("data",this.parseData.bind(this))
    }
    dbg(...args) {
        if (this.debug || true) {
            console.debug("=============")
        console.debug(...args)
        }
    }

    msgBytesRecieved = 0
    msgBytesRequired = 0
    msgBytes = ""
    msgRecieving = false
    parseData(data) {
        var string = data.toString()
        //this.dbg("data in",string)
        if (!this.msgRecieving && string.startsWith("MSG")) {
            this.msgBytesRequired = parseInt(string.split("\r\n")[0].split(" ")[3])
            this.msgBytes = string
            this.msgBytesRecieved = string.length
            this.msgRecieving = true
            return
        }
        if (this.msgRecieving) {
            this.dbg("got " + this.msgBytesRecieved + "/" + this.msgBytesRequired)
            this.msgBytes += string
            this.msgBytesRecieved += string.length
            if (this.msgBytesRecieved >= this.msgBytesRequired) {
                this.msgRecieving = false
                string = this.msgBytes
            }else {
                return
            }
        }
        
        var split = string.trim().split(" ")
        
        this.emit("raw_" + split[0], split);
    }
    waitFor(eventName) {
        return new Promise(function(a,r) {
            this.once(eventName,(err,data) => {
                if (err) {
                    this.dbg(err)
                    return r(err);
                } 
                return a(data) 
            })
        }.bind(this))
    }
    sendCommand(commandName, ...args) {
        this.trid += 1;
        this.dbg("data out",[commandName,this.trid,...args].join(" ") + "\r\n")
        this.conn.write([commandName,this.trid,...args].join(" ") + "\r\n")   
    }
}
