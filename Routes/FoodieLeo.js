const express = require("express");
const error = require("./Function/error");
const Request_Auth = require("./Function/request_auth");
const db_method = require("./Function/db_method");

const foodieLeo = express.Router();
const db_cart = "FoodieCart";
const db_menu = "FoodieMenu";

foodieLeo.post("/add_cart", Request_Auth.jwt_auth, (req, res) => {
    if (!req.body.type || !req.body.uid || !req.body.qty) {
        res.json(
            error.error_msg("Incomplete request.Please send type, uid and qty")
        );
    } else {
        var data = {
            type: req.body.type,
            uid: req.body.uid,
            qty: req.body.qty,
        };
        db_method
            .Find(db_cart, { uid: req.token_payload.data.uid })
            .then((result0) => {
                if (result0 === null) {
                    db_method
                        .Insert(db_cart, {
                            uid: req.token_payload.data.uid,
                            cart: [data],
                        })
                        .then((result1) => {
                            if (result1.insertedCount === 1) {
                                res.json({
                                    success: true,
                                    msg: "Added to cart",
                                });
                            } else {
                                res.json(
                                    error.error_msg("Something went wrong")
                                );
                            }
                        })
                        .catch((err) => {
                            throw err;
                        });
                } else {
                    db_method
                        .Find(db_cart, {
                            uid: req.token_payload.data.uid,
                        })
                        .then((result1) => {
                            var isFound = false;
                            for (var i = 0; i < result1.cart.length; i++) {
                                if (
                                    result1.cart[i].type == req.body.type &&
                                    result1.cart[i].uid == req.body.uid
                                ) {
                                    isFound = true;
                                    break;
                                }
                            }
                            if (isFound === true) {
                                db_method
                                    .Update(
                                        db_cart,
                                        {
                                            uid: req.token_payload.data.uid,
                                            "cart.type": req.body.type,
                                            "cart.uid": req.body.uid,
                                        },
                                        {
                                            "cart.$": {
                                                type: req.body.type,
                                                qty: req.body.qty,
                                                uid: req.body.uid,
                                            },
                                        }
                                    )
                                    .then((result2) => {
                                        console.log(result2);
                                        if (result2.value === null) {
                                            res.json(
                                                error.error_msg(
                                                    "Something went wrong"
                                                )
                                            );
                                        } else {
                                            res.json({
                                                success: true,
                                                msg: "Added to cart",
                                            });
                                        }
                                    })
                                    .catch((err) => {
                                        throw err;
                                    });
                            } else {
                                db_method
                                    .InsertArray(
                                        db_cart,
                                        {
                                            uid: req.token_payload.data.uid,
                                        },
                                        { cart: data }
                                    )
                                    .then((result2) => {
                                        if (result2.value === null) {
                                            res.json(
                                                error.error_msg(
                                                    "Something went wrong"
                                                )
                                            );
                                        } else {
                                            res.json({
                                                success: true,
                                                msg: "Added to cart",
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
    }
});
foodieLeo.post("/rm_cart", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .RemoveArray(
            db_cart,
            {
                uid: req.token_payload.data.uid,
            },
            { cart: { type: req.body.type, uid: req.body.uid } }
        )
        .then((result0) => {
            if (result0.modifiedCount === 0) {
                res.json(error.error_msg("Something went wrong!"));
            } else {
                res.json({
                    success: true,
                    msg: "Removed from cart successfully",
                });
            }
        })
        .catch((err) => {
            throw err;
        });
});
foodieLeo.get("/cart", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_cart, { uid: req.token_payload.data.uid })
        .then((result0) => {
            if (result0 === null) {
                res.json(error.error_msg("Cart not Found Try Again"));
            } else {
                res.json({ success: true, cart: result0.cart });
            }
        })
        .catch((err) => {
            throw err;
        });
});
foodieLeo.get("/menu", (req, res) => {
    db_method.FindAll(db_menu, {}).toArray((err, result0) => {
        if (err) throw err;
        res.json({ success: true, menu: result0 });
    });
});
module.exports = foodieLeo;
