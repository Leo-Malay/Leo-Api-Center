const jwt = require("jsonwebtoken");
const config = require("config");

const GenToken = (payload) => {
    return jwt.sign(payload, config.get("AUTH.JWT.SECRET"));
};
const VerifyToken = (token) => {
    try {
        return {
            success: true,
            data: jwt.verify(token, config.get("AUTH.JWT.SECRET")),
        };
    } catch (err) {
        return { success: false, data: err };
    }
};

export { GenToken, VerifyToken };
/*
payload : {
    gen:
    exp:  Math.floor(Date.now() / 1000) + (60 * 60)
    data: {}
}
*/
