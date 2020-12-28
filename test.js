const MSNPConnection = require("./index")
;(async function () {
    const conn = new MSNPConnection("vmpmc@hotmail.com")
    conn.debug = true
    conn.on("disconnected",console.error)
    conn.on("socketError",console.error)
    conn.on("selfPresenceChanged",console.log)
    var auth = await conn.login(process.argv[2]);
    console.log("we authed boys",auth)
    var dnd = false
    await conn.setPresence("NLN")
    setInterval(async function() {
        dnd = !dnd
        await conn.setPresence(dnd ? "BSY" : "NLN")
    },5000)
})()