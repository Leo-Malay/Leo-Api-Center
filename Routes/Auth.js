const express = require("express");
const db = require("../db");
const error = require("./Function/error");

const auth = express.Router();
const db_name = "Auth";

auth.post("/new_account", (req, res) => {
    var payload = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        address: req.body.address,
    };
    if (!payload.name || !payload.username || !payload.password) {
        res.json(
            error.error_msg(
                "Incomplete fields. Please provide Name, Username, Password"
            )
        );
    } else if (payload.password.length < 8) {
        res.json(error.error_msg("Password length is too small"));
    } else {
        db.getDB()
            .collection(db_name)
            .findOne({ username: payload.username }, (err, result0) => {
                if (err) throw err;
                if (result0) {
                    res.json(error.error_msg("Username Already Taken!"));
                } else {
                    db.getDB()
                        .collection(db_name)
                        .insertOne(payload, (err, result1) => {
                            if (err) throw err;
                            res.json({
                                success: true,
                                msg: "New Account Registered Successfully",
                            });
                        });
                }
            });
    }
});
auth.get("/account", (req, res) => {
    fetch(db_name, { username: "Malay" })
        .then((result0) => {
            res.json(result0);
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
    var payload = { username: req.body.username, password: req.body.password };
    if (!payload.username || !payload.password) {
        res.json(error.error_msg("Please Provide Username and Password"));
    } else {
    }
});
auth.post("/refresh_token", (req, res) => {
    var payload = req.body;
});

module.exports = auth;

const fetch = (dbname, payload) => {
    return db.getDB().collection(dbname).findOne(payload);
};
