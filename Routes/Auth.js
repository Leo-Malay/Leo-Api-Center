const Router = require("express").Router;
const jwt_auth = require("../Utils/request_auth").jwt_auth;
const { body } = require("express-validator");
const {
    NewAccount,
    Account,
    UpdateAccount,
    RemoveAccount,
    UpdatePassword,
    Login,
} = require("../Controllers/AuthController");
// Configuring the router.
const auth = Router();
// Configuring the paths along with validation
auth.post(
    "/new_account",
    body("fname").notEmpty().isAlpha(),
    body("lname").notEmpty().isAlpha(),
    body("username").notEmpty().isAlphanumeric(),
    body("password").notEmpty().isLength({ min: 8, max: 12 }).escape(),
    body("email").notEmpty().isEmail(),
    body("mobile").notEmpty().isMobilePhone(),
    body("country").notEmpty().isAlpha(),
    NewAccount
);
auth.get("/account", jwt_auth, Account);
auth.post(
    "/ch_account",
    body("fname").optional().isAlpha(),
    body("lname").optional().isAlpha(),
    body("username").optional().isAlphanumeric(),
    body("email").optional().isEmail(),
    body("mobile").optional().isMobilePhone(),
    body("country").optional().isAlpha(),
    jwt_auth,
    UpdateAccount
);
auth.post("/rm_account", jwt_auth, RemoveAccount);
auth.post(
    "/ch_password",
    body("old_password").notEmpty().isLength({ min: 8, max: 12 }).escape(),
    body("new_password").notEmpty().isLength({ min: 8, max: 12 }).escape(),
    jwt_auth,
    UpdatePassword
);
auth.post(
    "/login",
    body("username").notEmpty().isAlphanumeric(),
    body("password").notEmpty().isLength({ min: 8, max: 12 }).escape(),
    Login
);

module.exports = auth;
