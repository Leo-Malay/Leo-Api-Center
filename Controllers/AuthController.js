const { hash, compare } = require("bcrypt");
const db = require("../db");
const config = require("config");
const { validationResult } = require("express-validator");
const res_msg = require("../Utils/res_msg");
const GenToken = require("../Routes/token").GenToken;
const db_auth = "Auth";

const NewAccount = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    var payload = {
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username,
        password: req.body.password,
        personal: {
            email: req.body.email,
            mobile: req.body.mobile,
            country: req.body.country,
        },
        isDeleted: !1,
    };
    db.Find(db_auth, { username: payload.username, isDeleted: !1 }).then(
        (result0) => {
            if (result0)
                return res_msg.error(res, "Username already registered!");
            hash(
                payload.password,
                config.get("AUTH.BCRYPT.saltRound"),
                (err, pass_hash) => {
                    if (err) throw err;
                    payload.password = pass_hash;
                    db.Insert(db_auth, payload).then((result1) => {
                        if (result1.insertedCount === 1)
                            return res_msg.success(
                                res,
                                "Account Registered Successfully"
                            );
                        return res_msg.server_error(res);
                    });
                }
            );
        }
    );
};
const Account = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_auth, {
        _id: db.getOID(req.token.data.uid),
        username: req.token.data.username,
        isDeleted: !1,
    }).then((result0) => {
        if (result0 === null)
            return res_msg.error(res, "Unable to find your account");
        return res.status(200).json({
            success: true,
            payload: {
                fname: result0.fname,
                lname: result0.lname,
                username: result0.username,
                personal: result0.personal,
            },
        });
    });
};
const UpdateAccount = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    var payload = req.body;
    if (payload.username || payload.password || payload.token)
        return res_msg.error(res, "Cannot update your username and password!");
    if (payload?.email) {
        payload["personal.email"] = payload.email;
        delete payload.email;
    }
    if (payload?.mobile) {
        payload["personal.mobile"] = payload.mobile;
        delete payload.mobile;
    }
    if (payload?.country) {
        payload["personal.country"] = payload.country;
        delete payload.country;
    }
    db.Update(
        db_auth,
        {
            _id: db.getOID(req.token.data.uid),
            username: req.token.data.username,
            isDeleted: !1,
        },
        payload
    ).then((result0) => {
        if (result0.value === null)
            return res_msg.error(res, "Unable to find your account!");

        return res_msg.success(res, "Account Updated Successfully");
    });
};
const RemoveAccount = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    var payload = req.body;
    db.Find(db_auth, {
        _id: db.getOID(req.token.data.uid),
        username: req.token.data.username,
        isDeleted: !1,
    }).then((result0) => {
        if (result0 === null)
            return res_msg.error(res, "Unable to find your account");
        compare(payload.password, result0.password, (err, result1) => {
            if (err) throw err;
            if (result1 === false)
                return res_msg.error(res, "Incorrect Password");
            db.Update(
                db_auth,
                {
                    username: payload.username,
                    isDeleted: !1,
                },
                { isDeleted: !0, token: null }
            ).then((result2) => {
                if (result2.value)
                    return res_msg.success(res, "Account Deleted");
                res_msg.error(res, "Unable to delete! Try Again Later");
            });
        });
    });
};
const UpdatePassword = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_auth, {
        _id: db.getOID(req.token.data.uid),
        username: req.token.data.username,
        isDeleted: !1,
    }).then((result) => {
        compare(req.body.old_password, result.password, (err, result0) => {
            if (err) throw err;
            if (result0 == false)
                return res_msg.error(res, "Incorrect Old Password");
            hash(
                req.body.new_password,
                config.get("AUTH.BCRYPT.saltRound"),
                (err, pass_hash) => {
                    if (err) throw err;
                    db.Update(
                        db_auth,
                        {
                            _id: db.getOID(req.token.data.uid),
                            username: req.token.data.username,
                            isDeleted: !1,
                        },
                        { password: pass_hash }
                    ).then((result0) => {
                        if (result0.value === null)
                            return res_msg.error(
                                res,
                                "Unable to find your account!"
                            );
                        return res_msg.success(
                            res,
                            "Password Updated Successfully"
                        );
                    });
                }
            );
        });
    });
};
const Login = (req, res) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    var payload = {
        username: req.body.username,
        password: req.body.password,
        isDeleted: !1,
    };
    db.Find(db_auth, { username: payload.username, isDeleted: !1 }).then(
        (result0) => {
            if (result0 === null)
                return res_msg.error(res, "Unable to find your account");
            compare(
                payload.password,
                result0.password,
                function (err, result1) {
                    if (err) throw err;
                    if (result1 === false)
                        return res_msg.error(res, "Incorrect Password");
                    var token = GenToken(
                        {
                            uid: db.getID(result0._id),
                            username: result0.username,
                            isDeleted: !1,
                        },
                        1
                    );
                    db.Update(
                        db_auth,
                        {
                            username: payload.username,
                            isDeleted: !1,
                        },
                        { token: token }
                    ).then((result1) => {
                        if (result1.lastErrorObject.updatedExisting === true) {
                            req.session.user = {
                                username: payload.username,
                                token,
                            };
                            req.session.save();
                            return res.json({ success: true });
                        }
                        return res_msg.error(res, "Unable to generate token");
                    });
                }
            );
        }
    );
};

const Logout = (req, res) => {
    req.session.destroy();
    res_msg.success(res, "Logout Successful");
};
module.exports = {
    NewAccount,
    Account,
    UpdateAccount,
    RemoveAccount,
    UpdatePassword,
    Login,
    Logout,
};
