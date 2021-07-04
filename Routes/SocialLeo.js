const express = require("express");
const res_msg = require("./Function/res_msg");
const jwt_auth = require("./Function/request_auth").jwt_auth;
const db_method = require("./Function/db_method");
const ObjectId = require("mongodb").ObjectId;

const socialLeo = express.Router();
const db_user = "SocialUser";
const db_post = "SocialPost";

socialLeo.post("/register", jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { isDeleted: 0, uid: req.token.data.uid })
        .then((result0) => {
            if (result0 !== null) {
                res_msg.success(res, "User already registered");
            } else {
                db_method
                    .Insert(db_user, {
                        uid: req.token.data.uid,
                        aboutMe: "",
                        followers: [],
                        following: [],
                        posts: [],
                        isVerified: 0,
                        isDeleted: 0,
                        pendingFollowReq: [],
                    })
                    .then((result1) => {
                        if (result1.insertedCount !== 1) {
                            res_msg.error(
                                res,
                                "Unable to register you! Try Again Later"
                            );
                        } else {
                            res_msg.success(res, "User Registration Success");
                        }
                    });
            }
        });
});
socialLeo.get("/account", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
    }
});
socialLeo.post("/about_me", jwt_auth, (req, res) => {
    if (!req.body.aboutMe) {
        res_msg.error(res, "Please provide data in fieldName: aboutMe");
    } else {
    }
});
socialLeo.post("/follow", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
    }
});
socialLeo.post("/unfollow", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
    }
});
socialLeo.get("/post", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
    }
});
socialLeo.post("/post", jwt_auth, (req, res) => {
    if (!req.body.img_url) {
        res_msg.error(res, "Please provide img_url");
    } else {
        db_method
            .Insert(db_post, {
                uid: req.token.data.uid,
                username: req.token.data.username,
                img_url: req.body.img_url,
                likes: [],
                comments: [],
                date: Date.now(),
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0.insertedCount != 0) {
                    res_msg.success(res, "Post Added Successfully");
                } else {
                    res_msg.res_error(res, "Something went wrong! Try again");
                }
            });
    }
});
socialLeo.post("/like", jwt_auth, (req, res) => {
    if (!req.body.post_id) {
        res_msg.error(res, "Please provide Post_Id");
    } else {
        db_method
            .Find(db_post, { _id: ObjectId(req.body.post_id), isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "No such post found!");
                } else {
                    if (result0.likes.indexOf(req.token.data.uid) === -1) {
                        db_method
                            .InsertArray(
                                db_post,
                                {
                                    _id: ObjectId(req.body.post_id),
                                    isDeleted: 0,
                                },
                                { likes: req.token.data.uid }
                            )
                            .then((result1) => {
                                if (result1.value !== null) {
                                    res.status(200).json({
                                        success: true,
                                        msg: "Like added to the post",
                                        color: 1,
                                    });
                                } else {
                                    res_msg.error(
                                        res,
                                        "Unable to complete your action"
                                    );
                                }
                            });
                    } else {
                        db_method
                            .RemoveArray(
                                db_post,
                                {
                                    _id: ObjectId(req.body.post_id),
                                    isDeleted: 0,
                                },
                                { likes: req.token.data.uid }
                            )
                            .then((result1) => {
                                if (result1.value !== null) {
                                    res.status(200).json({
                                        success: true,
                                        msg: "Like removed from the post",
                                        color: 0,
                                    });
                                } else {
                                    res_msg.error(
                                        res,
                                        "Unable to complete your action"
                                    );
                                }
                            });
                    }
                }
            });
    }
});
socialLeo.post("/add_comment", jwt_auth, (req, res) => {
    if (!req.body.img_url) {
        res_msg.error(res, "Please provide img_url");
    } else {
    }
});
socialLeo.post("/rm_comment", jwt_auth, (req, res) => {
    if (!req.body.img_url) {
        res_msg.error(res, "Please provide img_url");
    } else {
    }
});

module.exports = socialLeo;
/**
 * SocialUser : [uid, aboutMe:"", followers:[], following:[], posts:[], isVerified:0, isDeleted:0, pendingFollowReq:[]]
 * SocialPost : [uid, username, img_url, likes:[] comments:[], date, isDeleted:0]
 */
