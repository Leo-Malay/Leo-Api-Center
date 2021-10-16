const Router = require("express").Router;
const jwt_auth = require("../Utils/request_auth").jwt_auth;
const {
    Register,
    DepositMoney,
    WithdrawMoney,
    GetTxn,
    PostTxn,
    CreateFD,
    GetFD,
    EncashFD,
    Balance,
} = require("../Controllers/LeoBankController");
const leoBank = Router();

leoBank.post("/register", jwt_auth, Register);
leoBank.post("/deposit_money", jwt_auth, DepositMoney);
leoBank.post("/withdraw_money", jwt_auth, WithdrawMoney);
leoBank.get("/txn", jwt_auth, GetTxn);
leoBank.post("/txn", jwt_auth, PostTxn);
leoBank.post("/create_fd", jwt_auth, CreateFD);
leoBank.get("/fd", jwt_auth, GetFD);
leoBank.post("/encash_fd", jwt_auth, EncashFD);
leoBank.get("/balance", jwt_auth, Balance);

module.exports = leoBank;
/**
 * USER --> [_id, uid, balance, fd:[amount, created], isDeleted, isVerified, pay_id]
 * TXN --> [_id, from_pay_id, to_pay_id, date, remarks]
 *
 * POST - register -> token
 * POST - deposit_money -> token, pay_id, amount
 * POST - withdraw_money -> token, amount
 * GET - txn -> token
 * POST - txn -> token, amount, pay_id
 * POST - create_fd -> token, amount
 * GET - fd -> token
 * POST - encash_fd -> token, fd_id
 * GET - balance -> token
 */
