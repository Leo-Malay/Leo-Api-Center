const express = require("express");
const auth = express.Router();
import { error_res } from "./Function/error";

auth.post("/new_account", (req, res) => {
    var payload = req.body;
    if (!payload.name || !payload.username || !payload.password) {
        res.json(
            error_res(
                "Incomplete fields. Please provide Name, Username, Password"
            )
        );
    } else if (payload.password.length < 8) {
        res.json(error_res("Password length is too small"));
    } else {
    }
});
auth.get("/account", (req, res) => {
    var payload = req.body;
});
auth.post("/ch_account", (req, res) => {
    var payload = req.body;
    if (payload.username || payload.password) {
        res.json(error_res("You cannot change your Username or Password"));
    } else {
    }
});
auth.post("/rm_account", (req, res) => {
    var payload = req.body;
    if (!payload.username || !payload.password) {
        res.json(error_res("Please Provide Username and Password"));
    } else {
    }
});
auth.post("/ch_password", (req, res) => {
    var payload = req.body;
    if (!payload.old_password || !payload.new_password) {
        res.json(error_res("Please Provide Old_password and New_password"));
    } else {
    }
});
auth.post("/login", (req, res) => {
    var payload = req.body;
    if (!payload.username || !payload.password) {
        res.json(error_res("Please Provide Username and Password"));
    } else {
    }
});
auth.post("/refresh_token", (req, res) => {
    var payload = req.body;
});

module.exports = auth;
