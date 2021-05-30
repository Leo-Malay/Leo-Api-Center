const jwt = require("jsonwebtoken");
const config = require("config");

const GenToken = (payload, days = 1) => {
    return jwt.sign(payload, config.get("AUTH.JWT.SECRET"), {
        expiresIn: `${days} days`,
    });
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

module.exports = { GenToken, VerifyToken };
