const express = require("express");
const error = require("./Function/error");
const Request_Auth = require("./Function/request_auth");
const db_method = require("./Function/db_method");

const foodieLeo = express.Router();
const db_cart = "FoodieCart";
const db_menu = "FoodieMenu";

foodieLeo.get("/cart", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_cart, {
            uid: req.token_payload.data.uid,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                res.json(error.error_msg("Didn't find any cart"));
            } else {
                res.json({ success: true, cart: result0.cart });
            }
        })
        .catch((err) => {
            throw err;
        });
});
foodieLeo.post("/cart", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_cart, {
            uid: req.token_payload.data.uid,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                db_method
                    .Insert(db_cart, {
                        uid: req.token_payload.data.uid,
                        cart: req.body.cart,
                        isDeleted: 0,
                    })
                    .then((result1) => {
                        if (result1.insertedCount !== 0) {
                            res.json({
                                success: true,
                                msg: "Cart Updated Successfully",
                            });
                        } else {
                            res.json(
                                error.error_msg(
                                    "Unable to complete your request"
                                )
                            );
                        }
                    })
                    .catch((err) => {
                        throw err;
                    });
            } else {
                db_method
                    .Update(
                        db_cart,
                        {
                            uid: req.token_payload.data.uid,
                            isDeleted: 0,
                        },
                        { cart: req.body.cart }
                    )
                    .then((result1) => {
                        if (result1 === null) {
                            res.json(
                                error.error_msg("Unable to update your cart")
                            );
                        } else {
                            res.json({
                                success: true,
                                msg: "Cart Updated Successfully",
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
foodieLeo.get("/menu", (req, res) => {
    db_method.FindAll(db_menu, {}).toArray((err, result0) => {
        if (err) throw err;
        res.json({ success: true, menu: result0 });
    });
});
foodieLeo.post("/order", Request_Auth.jwt_auth, (req, res) => {
    db_method
        .Find(db_cart, {
            uid: req.token_payload.data.uid,
            isDeleted: 0,
        })
        .then((result0) => {
            if (result0 === null) {
                res.json(error.error_msg("Unable to find your cart"));
            } else {
                if (result0.cart == "") {
                    res.json(error.error_msg("Add Some Items to Cart First"));
                } else {
                    db_method
                        .Update(
                            db_cart,
                            {
                                uid: req.token_payload.data.uid,
                                isDeleted: 0,
                            },
                            {
                                cart: "",
                                Order: {
                                    cart: result0.cart,
                                    dt: Date.now(),
                                    isDelivered: 0,
                                },
                            }
                        )
                        .then((result0) => {
                            if (result0 === null) {
                                res.json({
                                    success: false,
                                    msg: "Unable to Place your order",
                                });
                            } else {
                                res.json({
                                    success: true,
                                    msg: "Order Confirmed",
                                });
                            }
                        })
                        .catch((err) => {
                            throw err;
                        });
                }
            }
        })
        .catch((err) => {
            throw err;
        });
});

module.exports = foodieLeo;
