module.exports = function(data) {
    var s = data.join(" ").split("\r\n")
    var fl = s.shift()
    var cmd = fl.split(" ")
    var headers = {}
    var d= []
    var headersOver = false
    for (var l of s) {
        if (!headersOver && l.length > 1) {
            var sp = l.split(":")
            var headerName = sp.shift()
            var headerValue = sp.join(":").trim()
            headers[headerName] = headerValue
        } else if (!headersOver && l.length < 2) {
            headersOver = true
        } else {
            //debugger;
            d.push(l)
        }
    }
    return {
        passport: cmd[1], name: cmd[2], headers,data: d.join("\r\n")
    }
}