const express = require("express");
const res_msg = require("./Function/res_msg");
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
                res_msg.error(res, "Didn't find any cart");
            } else {
                res.status(200).json({ success: true, cart: result0.cart });
            }
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
                            res_msg.error(
                                res,
                                "Unable to complete your request"
                            );
                        }
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
                            res_msg.error(res, "Unable to update your cart");
                        } else {
                            res.status(200).json({
                                success: true,
                                msg: "Cart Updated Successfully",
                            });
                        }
                    });
            }
        });
});
foodieLeo.get("/menu", (req, res) => {
    db_method.FindAll(db_menu, {}).toArray((err, result0) => {
        if (err) throw err;
        res.status(200).json({ success: true, menu: result0 });
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
                res_msg.error(res, "Unable to find your cart");
            } else {
                if (result0.cart == "") {
                    res_msg.error(res, "Add Some Items to Cart First");
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
                                res_msg.error(
                                    res,
                                    "Unable to Place your order"
                                );
                            } else {
                                res.status(200).json({
                                    success: true,
                                    msg: "Order Confirmed",
                                });
                            }
                        });
                }
            }
        });
});

module.exports = foodieLeo;
