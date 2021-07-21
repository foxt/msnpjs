"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.getTweenerUrl = void 0;
const node_fetch_1 = require("node-fetch");
async function getTweenerUrl(nexus) {
    let f = await node_fetch_1.fetch(nexus);
    let ppurls = f.headers.get("passporturls");
    if (!ppurls) {
        throw new Error(nexus + " isn't a nexus!");
    }
    let dal = ppurls.split("DALogin=")[1].split(",")[0];
    return dal;
}
exports.getTweenerUrl = getTweenerUrl;
async function authenticate(nexus, passport, password, challenge) {
    let loginServer = await getTweenerUrl(nexus);
    console.log("Passport1.4 OrgVerb=GET,OrgURL=http%3A%2F%2Fmessenger%2Emsn%2Ecom,sign-in=" + encodeURIComponent(passport) + ",pwd=" + encodeURIComponent(password) + "," + challenge);
    let f = await node_fetch_1.fetch(loginServer, {
        headers: {
            Authorization: "Passport1.4 OrgVerb=GET,OrgURL=http%3A%2F%2Fmessenger%2Emsn%2Ecom,sign-in=" + encodeURIComponent(passport) + ",pwd=" + encodeURIComponent(password) + "," + challenge
        }
    });
    let ticket = f.headers.get("Authentication-Info");
    if (!ticket) {
        console.error(f);
        throw new Error("Failed to authenticate");
    }
    return ticket.split("from-PP='")[1].split("'")[0];
}
exports.authenticate = authenticate;
//# sourceMappingURL=tweener.js.map