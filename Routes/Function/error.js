function error_msg(msg) {
    return {
        success: false,
        msg: msg,
    };
}
function forbidden_error(msg) {
    return {
        success: false,
        msg: "This API is protected! You need Usename and Password to gain access!",
    };
}

module.exports = { error_msg, forbidden_error };
