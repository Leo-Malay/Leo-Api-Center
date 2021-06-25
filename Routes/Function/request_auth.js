const config = require("config");
const res_msg = require("./res_msg");
const VerifyToken = require("./token").VerifyToken;
const req_auth = (req, res, next) => {
    var payload = req.header;
    if (!payload.username || !payload.password) {
        res_msg.forbidden(res);
    } else if (
        payload.username === config.get("AUTH.API_AUTH.USERNAME") &&
        payload.password === config.get("AUTH.API_AUTH.PASSWORD")
    ) {
        next();
    } else {
        res_msg.error(res, "Incorrect API credentials");
    }
};
const jwt_auth = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
        req.token_payload = VerifyToken(bearerHeader.split(" ")[1]);
        if (req.token_payload.success === false) {
            res_msg.error(res, req.token_payload.msg);
        } else {
            next();
        }
    } else {
        res_msg.forbidden();
    }
};
module.exports = { req_auth, jwt_auth };
