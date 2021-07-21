export function parseMsg(data:string[]) {
    let s = data.join(" ").split("\r\n");
    let fl = s.shift();
    let cmd = fl!.split(" ");
    let headers: Map<string,string> = new Map<string,string>();
    let d = [];
    let headersOver = false;
    for (let l of s) {
        if (!headersOver && l.length > 1) {
            let sp = l.split(":");
            let headerName = sp.shift();
            let headerValue = sp.join(":").trim();
            headers.set(headerName!, headerValue);
        } else if (!headersOver && l.length < 2) {
            headersOver = true;
        } else {
            // debugger;
            d.push(l);
        }
    }
    return {
        passport: cmd[1], name: cmd[2], headers, data: d.join("\r\n")
    };
};