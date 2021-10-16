const bcrypt = require("bcrypt");
const db = require("../db");
const config = require("config");
const res_msg = require("../Utils/res_msg");
const GenToken = require("../Utils/token").GenToken;
const db_method = require("../Utils/db_method");

const db_auth = "Auth";
const NewAccount = (req, res, next) => {
    var payload = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        address: req.body.address,
        token: null,
        isDeleted: 0,
    };
    if (
        !payload.name ||
        !payload.username ||
        !payload.password ||
        !payload.email
    ) {
        res_msg.error(
            res,
            "Incomplete fields. Please provide Name, Username, Password and Email"
        );
    } else if (payload.password.length < 8) {
        res_msg.error(res, "Length of Password must be greater than 8");
    } else {
        db_method
            .Find(db_auth, { username: payload.username, isDeleted: 0 })
            .then((result0) => {
                if (result0) {
                    res_msg.error(res, "Username already registered!");
                } else {
                    bcrypt.hash(
                        payload.password,
                        config.get("AUTH.BCRYPT.saltRound"),
                        (err, pass_hash) => {
                            if (err) throw err;
                            payload.password = pass_hash;
                            db_method
                                .Insert(db_auth, payload)
                                .then((result1) => {
                                    if (result1.insertedCount === 1) {
                                        res_msg.success(
                                            res,
                                            "Account Registrated Successfully"
                                        );
                                    } else {
                                        res_msg.server_error(res);
                                    }
                                });
                        }
                    );
                }
            });
    }
};
const Account = (req, res, next) => {
    db_method
        .Find(db_auth, {
            _id: db.getOID(req.token.data.uid),
            username: req.token.data.username,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                res_msg.error(res, "Unable to find your account");
            } else {
                res.status(200).json({
                    success: true,
                    payload: {
                        name: result0.name,
                        username: result0.username,
                        email: result0.email,
                        address: result0.address,
                    },
                });
            }
        });
};
const UpdateAccount = (req, res, next) => {
    var payload = req.body;
    if (payload.username || payload.password || payload.token) {
        res_msg.error(res, "Cannot change Username or Password here!");
    } else {
        db_method
            .Update(
                db_auth,
                {
                    _id: db.getOID(req.token.data.uid),
                    username: req.token.data.username,
                    isDeleted: 0,
                },
                payload
            )
            .then((result0) => {
                if (result0.value === null) {
                    res_msg.error(res, "Unable to find your account!");
                } else {
                    res_msg.success(res, "Account Updated Successfully");
                }
            });
    }
};
const RemoveAccount = (req, res, next) => {
    var payload = req.body;
    if (!payload.username || !payload.password) {
        res_msg.error(res, "Provide Username & Password");
    } else if (payload.username !== req.token.data.username) {
        res_msg.error(res, "Incorrect Username");
    } else {
        db_method
            .Find(db_auth, {
                _id: db.getOID(req.token.data.uid),
                username: req.token.data.username,
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "Unable to find your account");
                } else {
                    bcrypt.compare(
                        payload.password,
                        result0.password,
                        function (err, result1) {
                            if (err) throw err;
                            if (result1 === true) {
                                db_method
                                    .Update(
                                        db_auth,
                                        {
                                            username: payload.username,
                                            isDeleted: 0,
                                        },
                                        { isDeleted: 1, token: null }
                                    )
                                    .then((result2) => {
                                        if (result2.value) {
                                            res_msg.success(
                                                res,
                                                "Account Deleted"
                                            );
                                        } else {
                                            res_msg.error(
                                                res,
                                                "Unable to delete! Try Again Later"
                                            );
                                        }
                                    });
                            } else {
                                res_msg.error(res, "Incorrect Password");
                            }
                        }
                    );
                }
            });
    }
};
const UpdatePassword = (req, res, next) => {
    res_msg.error(res, "API Under Construction");
};
const Login = (req, res, next) => {
    var payload = {
        username: req.body.username,
        password: req.body.password,
        isDeleted: 0,
    };
    if (!payload.username || !payload.password) {
        res_msg.error(res, "Provide Username & Password");
    } else {
        db_method
            .Find(db_auth, { username: payload.username, isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "Unable to find your account");
                } else {
                    bcrypt.compare(
                        payload.password,
                        result0.password,
                        function (err, result1) {
                            if (err) throw err;
                            if (result1 === true) {
                                var token = GenToken(
                                    {
                                        uid: db.getID(result0._id),
                                        username: result0.username,
                                        isDeleted: 0,
                                    },
                                    1
                                );
                                db_method
                                    .Update(
                                        db_auth,
                                        {
                                            username: payload.username,
                                            isDeleted: 0,
                                        },
                                        { token: token }
                                    )
                                    .then((result1) => {
                                        if (
                                            result1.lastErrorObject
                                                .updatedExisting === true
                                        ) {
                                            res.json({ success: true, token });
                                        } else {
                                            res_msg.error(
                                                res,
                                                "Unable to generate token"
                                            );
                                        }
                                    });
                            } else {
                                res_msg.error(res, "Incorrect Password");
                            }
                        }
                    );
                }
            });
    }
};

module.exports = {
    NewAccount,
    Account,
    UpdateAccount,
    RemoveAccount,
    UpdatePassword,
    Login,
};
