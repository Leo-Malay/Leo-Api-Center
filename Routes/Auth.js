const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const config = require("config");
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
                    bcrypt.hash(
                        payload.password,
                        config.get("AUTH.BCRYPT.saltRound"),
                        (err, pass_hash) => {
                            if (err) throw err;
                            payload.password = pass_hash;
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
                                            error.error_msg(
                                                "Some Problem Occured"
                                            )
                                        );
                                    }
                                })
                                .catch((err) => {
                                    throw err;
                                });
                        }
                    );
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
            _id: db.getOID(req.token_payload.data.uid),
            username: req.token_payload.data.username,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                res.json(error.error_msg("Something Got Wrong Try Again"));
            } else {
                res.json({
                    success: true,
                    payload: {
                        name: result0.name,
                        username: result0.username,
                        email: result0.email,
                        address: result0.address,
                    },
                });
            }
        })
        .catch((err) => {
            throw err;
        });
});
auth.post("/ch_account", Request_Auth.jwt_auth, (req, res) => {
    var payload = req.body;
    if (payload.username || payload.password) {
        res.json(
            error.error_msg("You cannot change your Username or Password")
        );
    } else {
        db_method
            .Update(
                db_name,
                {
                    _id: db.getOID(req.token_payload.data.uid),
                    username: req.token_payload.data.username,
                    isDeleted: 0,
                },
                payload
            )
            .then((result0) => {
                if (result0.value === null) {
                    res.json(
                        error.error_msg(
                            "Some problem occured while updating your account"
                        )
                    );
                } else {
                    res.json({
                        success: true,
                        msg: "Account Updated Successfully",
                    });
                }
            })
            .catch((err) => {
                throw err;
            });
    }
});
auth.post("/rm_account", Request_Auth.jwt_auth, (req, res) => {
    var payload = req.body;
    if (!payload.username || !payload.password) {
        res.json(error.error_msg("Please Provide Username and Password"));
    } else if (payload.username !== req.token_payload.data.username) {
        res.json(
            error.error_msg("You have ne access to this account! Try Re-Login")
        );
    } else {
        db_method
            .Find(db_name, {
                _id: db.getOID(req.token_payload.data.uid),
                username: req.token_payload.data.username,
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0 === null) {
                    res.json(
                        error.error_msg(
                            "Please Try Re-Login! Your token doesn't seems right"
                        )
                    );
                } else {
                    bcrypt.compare(
                        payload.password,
                        result0.password,
                        function (err, result1) {
                            if (err) throw err;
                            if (result1 === true) {
                                db_method
                                    .Update(
                                        db_name,
                                        {
                                            username: payload.username,
                                            isDeleted: 0,
                                        },
                                        { isDeleted: 1 }
                                    )
                                    .then((result2) => {
                                        if (result2.value) {
                                            res.json({
                                                success: true,
                                                msg: "Account Deleted Successfully",
                                            });
                                        } else {
                                            res.json(
                                                error.error_msg(
                                                    "Some problem Occured. Please try again"
                                                )
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        throw err;
                                    });
                            } else {
                                res.json(
                                    error.error_msg(
                                        "Incorrect password. Please try again"
                                    )
                                );
                            }
                        }
                    );
                }
            })
            .catch((err) => {
                throw err;
            });
    }
});
auth.post("/ch_password", (req, res) => {
    res.json(error.error_msg("This api is not yet functioning"));
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
            .Find(db_name, { username: payload.username, isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res.json(
                        error.error_msg("Please check Username and Password")
                    );
                } else {
                    bcrypt.compare(
                        payload.password,
                        result0.password,
                        function (err, result1) {
                            if (err) throw err;
                            if (result1 === true) {
                                var token = Token.GenToken(
                                    {
                                        uid: db.getID(result0._id),
                                        username: result0.username,
                                        isDeleted: 0,
                                    },
                                    1
                                );
                                res.json({ success: true, token });
                            } else {
                                res.json(
                                    error.error_msg(
                                        "Incorrect password. Please try again"
                                    )
                                );
                            }
                        }
                    );
                }
            })
            .catch((err) => {
                throw err;
            });
    }
});

module.exports = auth;
