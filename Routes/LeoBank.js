const express = require("express");
const error = require("./Function/error");
const Request_Auth = require("./Function/request_auth");
const db_method = require("./Function/db_method");
const { json } = require("express");

const leoBank = express.Router();
const db_user = "BankUser";
const db_txn = "BankTxn";

leoBank.post("/register", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { uid: req.token_payload.data.uid, isDeleted: 0 })
        .then((result0) => {
            if (result0 == null) {
                payload = {
                    uid: req.token_payload.data.uid,
                    pay_id: req.token_payload.data.username,
                    balance: 0,
                    fd: [],
                    isDeleted: 0,
                    isVerified: 0,
                };
                db_method
                    .Insert(db_user, payload)
                    .then((result1) => {
                        if (result1.insertedCount != 0) {
                            res.json({
                                success: true,
                                msg: "User Registeration Successfull",
                            });
                        } else {
                            res.json(
                                error.error_msg(
                                    "Something went wrong! Try again"
                                )
                            );
                        }
                    })
                    .catch((err) => {
                        throw err;
                    });
            } else {
                res.json({ success: true, msg: "Already a registered user" });
            }
        })
        .catch((err) => {
            throw err;
        });
});
leoBank.post("/deposit_money", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Update(
            db_user,
            { pay_id: req.body.pay_id, isDeleted: 0 },
            { $inc: { balance: req.body.amount } }
        )
        .then((result0) => {
            console.log(result0);
            if (result0 == null) {
                res.json(
                    error.error_msg(
                        "Something went wrong! Please wait sometime and then try again"
                    )
                );
            } else {
                db_method
                    .Insert(db_txn, {
                        from_pay_id: "BANK",
                        to_pay_id: req.body.pay_id,
                        date: Date.now(),
                        remarks: "Added Money from Bank to LeoBank",
                    })
                    .then((result1) => {
                        res.json({
                            success: true,
                            msg: "Money Added Successfully",
                            balance: result0.balance,
                        });
                    })
                    .catch((err) => {
                        throw err;
                    });
            }
        })
        .catch((err) => {
            throw err;
        });
});
leoBank.post("/withdraw_money", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { pay_id: req.body.pay_id, isDeleted: 0 })
        .then((result0) => {
            if (result0.balance <= req.body.amount) {
                res.json(error.error_msg("Insufficient Balance"));
            } else {
                db_method
                    .Update(
                        db_user,
                        { pay_id: req.body.pay_id, isDeleted: 0 },
                        { $inc: { balance: -req.body.amount } }
                    )
                    .then((result0) => {
                        console.log(result0);
                        if (result0 == null) {
                            res.json(
                                error.error_msg(
                                    "Something went wrong! Please wait sometime and then try again"
                                )
                            );
                        } else {
                            db_method
                                .Insert(db_txn, {
                                    from_pay_id: req.body.pay_id,
                                    to_pay_id: "BANK",
                                    date: Date.now(),
                                    remarks: "Added Money from LeoBank to Bank",
                                })
                                .then((result1) => {
                                    res.json({
                                        success: true,
                                        msg: "Money Withdrawal Successfull",
                                        balance: result0.balance,
                                    });
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
        })
        .catch((err) => {
            throw err;
        });
});
leoBank.get("/txn", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .FindAll(db_txn, {
            $or: [
                { to_pay_id: req.token_payload.data.username },
                { from_pay_id: req.token_payload.data.username },
            ],
        })
        .toArray((err, result0) => {
            if (err) throw err;
            res.json({ success: true, txn: result0 });
        });
});
leoBank.post("/txn", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_user, {
            uid: req.token_payload.data.uid,
            pay_id: req.token_payload.data.username,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0.balance <= req.body.amount) {
                res.json(error.error_msg("Insufficient Balance"));
            } else {
                db_method
                    .Update(
                        db_user,
                        {
                            uid: req.token_payload.data.uid,
                            pay_id: req.token_payload.data.username,
                            isDeleted: 0,
                        },
                        { $inc: { balance: -req.body.amount } }
                    )
                    .then((result1) => {
                        console.log(result1);
                        if (result1 == null) {
                            res.json(
                                error.error_msg(
                                    "Something went wrong! Please wait sometime and then try again"
                                )
                            );
                        } else {
                            db_method
                                .Update(
                                    db_user,
                                    {
                                        pay_id: req.body.pay_id,
                                        isDeleted: 0,
                                    },
                                    { $inc: { balance: req.body.amount } }
                                )
                                .then((result2) => {
                                    console.log(result2);
                                    if (result2 == null) {
                                        res.json(
                                            error.error_msg(
                                                "Something went wrong! Please wait sometime and then try again"
                                            )
                                        );
                                    } else {
                                        db_method
                                            .Insert(db_txn, {
                                                from_pay_id:
                                                    req.token_payload.data
                                                        .username,
                                                to_pay_id: req.body.pay_id,
                                                date: Date.now(),
                                                remarks: req.body.remarks,
                                            })
                                            .then((result3) => {
                                                res.json({
                                                    success: true,
                                                    msg: "Money Transfered Successfully",
                                                    balance: result3.balance,
                                                });
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
                    })
                    .catch((err) => {
                        throw err;
                    });
            }
        })
        .catch((err) => {
            throw err;
        });
});
leoBank.post("/create_fd", Request_Auth.jwt_auth, (req, res) => {});
leoBank.get("/fd", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_user, {
            uid: req.token_payload.data.uid,
            pay_id: req.token_payload.data.username,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 == null) {
                res.json(error.error_msg("Unable to fetch your FDs"));
            } else {
                res.json({ success: true, fd: result0.fd });
            }
        })
        .catch((err) => {
            throw err;
        });
});
leoBank.post("/destroy_fd", Request_Auth.jwt_auth, (req, res) => {});
leoBank.get("/balance", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { uid: req.token_payload.data.uid, isDeleted: 0 })
        .then((result0) => {
            if (result0 != null) {
                res.json({ success: true, balance: result0.balance });
            } else {
                res.json(error.error_msg("Unable to fetch your balance"));
            }
        })
        .catch((err) => {
            throw err;
        });
});

module.exports = leoBank;
/**
 * USER --> [_id, uid, balance, fd:[amount, created], isDeleted, isVerified, pay_id]
 * TXN --> [_id, from_pay_id, to_pay_id, date, remarks]
 */
