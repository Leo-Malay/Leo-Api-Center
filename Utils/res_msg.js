const server_error = (res) => {
    res.status(500).json({
        success: false,
        msg: "Were unable to process your request. Please try again later",
    });
};
const error = (res, msg) => {
    res.status(400).json({
        success: false,
        msg: msg,
    });
};
const forbidden = (res) => {
    res.status(403).json({
        success: false,
        msg: "This API is protected! You need Usename and Password to gain access!",
    });
};
const success = (res, msg) => {
    res.status(200).json({
        success: true,
        msg: msg,
    });
};
module.exports = { server_error, error, forbidden, success };
