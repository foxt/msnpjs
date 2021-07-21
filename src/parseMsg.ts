export function parseMsg(data) {
    let s = data.join(" ").split("\r\n");
    let fl = s.shift();
    let cmd = fl.split(" ");
    let headers = {};
    let d = [];
    let headersOver = false;
    for (let l of s) {
        if (!headersOver && l.length > 1) {
            let sp = l.split(":");
            let headerName = sp.shift();
            let headerValue = sp.join(":").trim();
            headers[headerName] = headerValue;
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