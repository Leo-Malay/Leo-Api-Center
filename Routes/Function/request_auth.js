const config = require("config");
const forbidden_error = require("./error").forbidden_error;
const error_msg = require("./error").error_msg;
const VerifyToken = require("./token").VerifyToken;
const req_auth = (req, res, next) => {
    var payload = req.header;
    if (!payload.username || !payload.password) {
        res.json(forbidden_error());
    } else if (
        payload.username === config.get("AUTH.API_AUTH.USERNAME") &&
        payload.password === config.get("AUTH.API_AUTH.PASSWORD")
    ) {
        next();
    } else {
        res.json(error_msg("Provided Username or Password is Incorrect!"));
    }
};
const jwt_auth = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
        req.token_payload = VerifyToken(bearerHeader.split(" ")[1]);
        next();
    } else {
        res.json(error_msg("Protected API. Please send required Token"));
    }
};
exports = { req_auth, jwt_auth };