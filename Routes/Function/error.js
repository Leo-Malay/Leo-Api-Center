const error_msg = (msg) => {
    return {
        success: false,
        msg: msg,
    };
};
const forbidden_error = (msg) => {
    return {
        success: false,
        msg: "This API is protected! You need Usename and Password to gain access!",
    };
};

export { error_msg, forbidden_error };
