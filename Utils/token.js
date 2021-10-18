const { sign, verify } = require("jsonwebtoken");
const config = require("config");

const GenToken = (payload, days = 1) => {
    return sign(payload, config.get("AUTH.JWT.SECRET"), {
        expiresIn: `${days} days`,
    });
};
const VerifyToken = (token) => {
    try {
        return {
            success: true,
            data: verify(token, config.get("AUTH.JWT.SECRET")),
        };
    } catch (err) {
        return { success: false, msg: err.name };
    }
};

module.exports = { GenToken, VerifyToken };
