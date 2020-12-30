const MSNPConnection = require("./index")
const conn = new MSNPConnection("vmpmc@hotmail.com",{
    capabilities: 17021669
})
module.exports = conn
;(async function () {
    
    //conn.debug = true
    conn.on("disconnected",console.error)
    conn.on("socketError",console.error)
    conn.on("selfPresenceChanged",console.log)
    conn.on("msgRecieved",console.log)
    var auth = await conn.login(process.argv[2]);
    console.log("we authed boys",auth)
    await conn.setPresence("NLN")
    conn.on("invitationRecieved",function(err,invitation) {
        var sbc = new MSNPConnection.Switchboard(conn.passport,invitation)
        sbc.debug = true
        global.sbc = sbc
        sbc.on("rosterComplete",console.log)
        sbc.on("msgRecieved",console.log)
        console.log(sbc)
    })


})()