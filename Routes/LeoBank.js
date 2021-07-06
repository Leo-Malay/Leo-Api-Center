const express = require("express");
const res_error = require("./Function/res_msg").error;
const jwt_auth = require("./Function/request_auth").jwt_auth;
const db_method = require("./Function/db_method");
const ObjectId = require("mongodb").ObjectId;

const leoBank = express.Router();
const db_user = "BankUser";
const db_txn = "BankTxn";

leoBank.post("/register", jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
        .then((result0) => {
            if (result0 === null) {
                payload = {
                    uid: req.token.data.uid,
                    pay_id: req.token.data.username,
                    balance: 0,
                    fd: [],
                    isDeleted: 0,
                    isVerified: 0,
                };
                db_method.Insert(db_user, payload).then((result1) => {
                    if (result1.insertedCount != 0) {
                        res.status(200).json({
                            success: true,
                            msg: "User Registeration Successfull",
                        });
                    } else {
                        res_error(res, "Something went wrong! Try again");
                    }
                });
            } else {
                res.status(200).json({
                    success: true,
                    msg: "Already a registered user",
                });
            }
        });
});
leoBank.post("/deposit_money", jwt_auth, (req, res) => {
    if (!req.body.amount || !req.body.pay_id) {
        res_error(res, "Missing Fields!");
    } else {
        const amount_money = parseInt(req.body.amount);
        db_method
            .UpdateRaw(
                db_user,
                { pay_id: req.body.pay_id, isDeleted: 0 },
                { $inc: { balance: amount_money } }
            )
            .then((result0) => {
                if (result0.value === null) {
                    res_error(
                        res,
                        "Something went wrong! Please wait sometime and then try again"
                    );
                } else {
                    db_method
                        .Insert(db_txn, {
                            from_pay_id: "BANK",
                            to_pay_id: req.body.pay_id,
                            amount: amount_money,
                            date: Date.now(),
                            remarks: "Deposited Money to LeoBank",
                        })
                        .then((result1) => {
                            res.status(200).json({
                                success: true,
                                msg: "Money Added Successfully",
                                balance: result0.value.balance + amount_money,
                            });
                        });
                }
            });
    }
});
leoBank.post("/withdraw_money", jwt_auth, (req, res) => {
    if (!req.body.amount || !req.body.pay_id) {
        res_error(res, "Missing Fields!");
    } else {
        const amount_money = parseInt(req.body.amount);
        db_method
            .Find(db_user, {
                pay_id: req.token.data.username,
                uid: req.token.data.uid,
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0.balance <= amount_money) {
                    res_error(res, "Insufficient Balance");
                } else {
                    db_method
                        .UpdateRaw(
                            db_user,
                            {
                                pay_id: req.token.data.username,
                                isDeleted: 0,
                            },
                            { $inc: { balance: -amount_money } }
                        )
                        .then((result0) => {
                            if (result0.value === null) {
                                res_error(
                                    res,
                                    "Something went wrong! Please wait sometime and then try again"
                                );
                            } else {
                                db_method
                                    .Insert(db_txn, {
                                        from_pay_id: req.token.data.username,
                                        to_pay_id: "BANK",
                                        amount: amount_money,
                                        date: Date.now(),
                                        remarks:
                                            "Withdrawed Money from LeoBank",
                                    })
                                    .then((result1) => {
                                        res.status(200).json({
                                            success: true,
                                            msg: "Money Withdrawal Successfull",
                                            balance:
                                                result0.value.balance -
                                                amount_money,
                                        });
                                    });
                            }
                        });
                }
            });
    }
});
leoBank.get("/txn", jwt_auth, (req, res) => {
    db_method
        .FindAll(db_txn, {
            $or: [
                { to_pay_id: req.token.data.username },
                { from_pay_id: req.token.data.username },
            ],
        })
        .toArray((err, result0) => {
            if (err) throw err;
            res.status(200).json({ success: true, txn: result0 });
        });
});
leoBank.post("/txn", jwt_auth, (req, res) => {
    if (!req.body.amount || !req.body.pay_id) {
        res_error(res, "Missing Fields!");
    } else {
        const amount_money = parseInt(req.body.amount);
        db_method
            .Find(db_user, {
                uid: req.token.data.uid,
                pay_id: req.token.data.username,
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0.balance <= amount_money) {
                    res_error(res, "Insufficient Balance");
                } else {
                    db_method
                        .UpdateRaw(
                            db_user,
                            {
                                uid: req.token.data.uid,
                                pay_id: req.token.data.username,
                                isDeleted: 0,
                            },
                            { $inc: { balance: -amount_money } }
                        )
                        .then((result1) => {
                            if (result1.value === null) {
                                res_error(
                                    res,
                                    "Something went wrong! Please wait sometime and then try again"
                                );
                            } else {
                                db_method
                                    .UpdateRaw(
                                        db_user,
                                        {
                                            pay_id: req.body.pay_id,
                                            isDeleted: 0,
                                        },
                                        {
                                            $inc: {
                                                balance: amount_money,
                                            },
                                        }
                                    )
                                    .then((result2) => {
                                        if (result2.value === null) {
                                            res_error(
                                                res,
                                                "Something went wrong! Please wait sometime and then try again"
                                            );
                                        } else {
                                            db_method
                                                .Insert(db_txn, {
                                                    from_pay_id:
                                                        req.token.data.username,
                                                    to_pay_id: req.body.pay_id,
                                                    amount: amount_money,
                                                    date: Date.now(),
                                                    remarks:
                                                        req.body.remarks ||
                                                        "Other",
                                                })
                                                .then((result3) => {
                                                    res.status(200).json({
                                                        success: true,
                                                        msg: "Money Transfered Successfully",
                                                        balance:
                                                            result3.balance,
                                                    });
                                                });
                                        }
                                    });
                            }
                        });
                }
            });
    }
});
leoBank.post("/create_fd", jwt_auth, (req, res) => {
    if (!req.body.amount) {
        res_error(res, "Missing Fields!");
    } else {
        const amount_money = parseInt(req.body.amount);
        db_method
            .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res_error(res, "Try Again Later. Suggested: Re-Login");
                } else if (result0.balance <= amount_money) {
                    res_error(res, "Insufficient Balance");
                } else {
                    db_method
                        .UpdateRaw(
                            db_user,
                            { uid: req.token.data.uid, isDeleted: 0 },
                            { $inc: { balance: -amount_money } }
                        )
                        .then((result0) => {
                            if (result0.value === null) {
                                res_error(
                                    res,
                                    "Something went wrong! Please wait sometime and then try again"
                                );
                            } else {
                                db_method
                                    .InsertArray(
                                        db_user,
                                        {
                                            uid: req.token.data.uid,
                                            isDeleted: 0,
                                        },
                                        {
                                            fd: {
                                                fd_id: ObjectId(),
                                                amount: amount_money,
                                                date: Date.now(),
                                            },
                                        }
                                    )
                                    .then((result1) => {
                                        db_method
                                            .Insert(db_txn, {
                                                from_pay_id:
                                                    req.token.data.username,
                                                to_pay_id: "BANK",
                                                amount: amount_money,
                                                date: Date.now(),
                                                remarks: "FD Created by User",
                                            })
                                            .then((result1) => {
                                                res.status(200).json({
                                                    success: true,
                                                    msg: "FD created Successfully",
                                                    balance: result0.balance,
                                                });
                                            });
                                    });
                            }
                        });
                }
            });
    }
});
leoBank.get("/fd", jwt_auth, (req, res) => {
    db_method
        .Find(db_user, {
            uid: req.token.data.uid,
            pay_id: req.token.data.username,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                res_error(res, "Unable to fetch your FDs");
            } else {
                res.status(200).json({ success: true, fd: result0.fd });
            }
        });
});
leoBank.post("/encash_fd", jwt_auth, (req, res) => {
    if (!req.body.fd_id) {
        res_error(res, "Missing Fields!");
    } else {
        db_method
            .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res_error(res, "Try Again Later. Suggested: Re-Login");
                } else {
                    var amount = null;
                    for (var i = 0; i < result0.fd.length; i++) {
                        if (result0.fd[i].fd_id == req.body.fd_id) {
                            amount = result0.fd[i].amount;
                            break;
                        }
                    }
                    if (amount !== null) {
                        db_method
                            .RemoveArray(
                                db_user,
                                {
                                    uid: req.token.data.uid,
                                    isDeleted: 0,
                                },
                                { fd: { fd_id: ObjectId(req.body.fd_id) } }
                            )
                            .then((result0) => {
                                if (result0.value === null) {
                                    res_error(
                                        res,
                                        "Something went wrong! Please wait sometime and then try again"
                                    );
                                } else {
                                    db_method
                                        .UpdateRaw(
                                            db_user,
                                            {
                                                uid: req.token.data.uid,
                                                isDeleted: 0,
                                            },
                                            { $inc: { balance: amount } }
                                        )
                                        .then((result1) => {
                                            db_method
                                                .Insert(db_txn, {
                                                    from_pay_id: "BANK",
                                                    to_pay_id:
                                                        req.token.data.username,
                                                    amount: amount,
                                                    date: Date.now(),
                                                    remarks:
                                                        "Encashed FD by User",
                                                })
                                                .then((result2) => {
                                                    res.status(200).json({
                                                        success: true,
                                                        msg: "FD Encashed Successfully",
                                                        balance:
                                                            result0.balance,
                                                    });
                                                });
                                        });
                                }
                            });
                    } else {
                        res_error(res, "Unable to find your FD");
                    }
                }
            });
    }
});
leoBank.get("/balance", jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
        .then((result0) => {
            if (result0 != null) {
                res.status(200).json({
                    success: true,
                    balance: result0.balance,
                });
            } else {
                res_error(res, "Unable to fetch your balance");
            }
        });
});

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
