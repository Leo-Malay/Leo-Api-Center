const express = require("express");
const error = require("./Function/error");
const Token = require("./Function/token");
const Request_Auth = require("./Function/request_auth");
const db_method = require("./Function/db_method");
const auth = express.Router();
const db_name = "Auth";

auth.post("/new_account", (req, res) => {
    var payload = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        address: req.body.address,
        isDeleted: 0,
    };
    if (
        !payload.name ||
        !payload.username ||
        !payload.password ||
        !payload.email
    ) {
        res.json(
            error.error_msg(
                "Incomplete fields. Please provide Name, Username, Password and Email"
            )
        );
    } else if (payload.password.length < 8) {
        res.json(error.error_msg("Password length is too small"));
    } else {
        db_method
            .Find(db_name, { username: payload.username, isDeleted: 0 })
            .then((result0) => {
                if (result0) {
                    res.json(error.error_msg("Username Already Taken!"));
                } else {
                    db_method
                        .Insert(db_name, payload)
                        .then((result1) => {
                            if (result1.insertedCount === 1) {
                                res.json({
                                    success: true,
                                    msg: "New Account Registered Successfully",
                                });
                            } else {
                                res.json(
                                    error.error_msg("Some Problem Occured")
                                );
                            }
                        })
                        .catch((err) => {
                            throw err;
                        });
                }
            })
            .catch((err) => {
                throw err;
            });
    }
});
auth.get("/account", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_name, {
            name: req.token_payload.data.name,
            username: req.token_payload.data.username,
            email: req.token_payload.data.email,
            isDeleted: 0,
        })
        .then((result0) => {
            res.json({
                success: true,
                payload: {
                    name: result0.name,
                    username: result0.username,
                    email: result0.email,
                    address: result0.address,
                },
            });
        })
        .catch((err) => {
            throw err;
        });
});
auth.post("/ch_account", (req, res) => {
    var payload = req.body;
    if (!payload) {
        res.json(
            error.error_msg("You cannot change your Username or Password")
        );
    } else {
    }
});
auth.post("/rm_account", (req, res) => {
    var payload = req.body;
    if (!payload.username || !payload.password) {
        res.json(error.error_msg("Please Provide Username and Password"));
    } else {
    }
});
auth.post("/ch_password", (req, res) => {
    var payload = req.body;
    if (!payload.old_password || !payload.new_password) {
        res.json(
            error.error_msg("Please Provide Old_password and New_password")
        );
    } else {
    }
});
auth.post("/login", (req, res) => {
    var payload = {
        username: req.body.username,
        password: req.body.password,
        isDeleted: 0,
    };
    if (!payload.username || !payload.password) {
        res.json(error.error_msg("Please Provide Username and Password"));
    } else {
        db_method
            .Find(db_name, payload)
            .then((result0) => {
                var token = Token.GenToken(
                    {
                        username: result0.username,
                        email: result0.email,
                        name: result0.name,
                    },
                    1
                );
                res.json({ success: true, token });
            })
            .catch((err) => {
                throw err;
            });
    }
});

module.exports = auth;
