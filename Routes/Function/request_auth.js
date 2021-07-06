const config = require("config");
const res_msg = require("./res_msg");
const VerifyToken = require("./token").VerifyToken;
const db_method = require("./db_method");
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
        token = bearerHeader.split(" ")[1];
        req.token = VerifyToken(token);
        if (req.token.success === false) {
            res_msg.error(res, req.token.msg);
        } else {
            db_method
                .Find("Auth", { token: token, isDeleted: 0 })
                .then((result0) => {
                    if (result0.username !== req.token.data.username) {
                        res_msg.error(res, "Token Mismatch! Try Login again");
                    } else {
                        next();
                    }
                });
        }
    } else {
        res_msg.forbidden(res);
    }
};
module.exports = { req_auth, jwt_auth };
