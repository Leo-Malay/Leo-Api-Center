const Router = require("express").Router;
const jwt_auth = require("../Utils/request_auth").jwt_auth;
const {
    NewAccount,
    Account,
    UpdateAccount,
    RemoveAccount,
    UpdatePassword,
    Login,
} = require("../Controllers/AuthController");
const auth = Router();
auth.post("/new_account", NewAccount);
auth.get("/account", jwt_auth, Account);
auth.post("/ch_account", jwt_auth, UpdateAccount);
auth.post("/rm_account", jwt_auth, RemoveAccount);
auth.post("/ch_password", UpdatePassword);
auth.post("/login", Login);

module.exports = auth;
