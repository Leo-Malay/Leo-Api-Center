const db = require("../db");
const res_msg = require("../Utils/res_msg");
const db_cart = "FoodieCart";
const db_menu = "FoodieMenu";

const GetCart = (req, res, next) => {
    db.Find(db_cart, {
        uid: req.token.data.uid,
        isDeleted: 0,
    }).then((result0) => {
        if (result0 === null) {
            res_msg.error(res, "Didn't find any cart");
        } else {
            res.status(200).json({ success: true, cart: result0.cart });
        }
    });
};
const PostCart = (req, res, next) => {
    db.Find(db_cart, {
        uid: req.token.data.uid,
        isDeleted: 0,
    }).then((result0) => {
        if (result0 === null) {
            db.Insert(db_cart, {
                uid: req.token.data.uid,
                cart: req.body.cart,
                isDeleted: 0,
            }).then((result1) => {
                if (result1.insertedCount !== 0) {
                    res.json({
                        success: true,
                        msg: "Cart Updated Successfully",
                    });
                } else {
                    res_msg.error(res, "Unable to complete your request");
                }
            });
        } else {
            db.Update(
                db_cart,
                {
                    uid: req.token.data.uid,
                    isDeleted: 0,
                },
                { cart: req.body.cart }
            ).then((result1) => {
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
};
const Menu = (req, res, next) => {
    db.FindAll(db_menu, {}).toArray((err, result0) => {
        if (err) throw err;
        res.status(200).json({ success: true, menu: result0 });
    });
};
const Order = (req, res, next) => {
    db.Find(db_cart, {
        uid: req.token.data.uid,
        isDeleted: 0,
    }).then((result0) => {
        if (result0 === null) {
            res_msg.error(res, "Unable to find your cart");
        } else {
            if (result0.cart == "") {
                res_msg.error(res, "Add Some Items to Cart First");
            } else {
                db.Update(
                    db_cart,
                    {
                        uid: req.token.data.uid,
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
                ).then((result0) => {
                    if (result0 === null) {
                        res_msg.error(res, "Unable to Place your order");
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
};

module.exports = { GetCart, PostCart, Menu, Order };
