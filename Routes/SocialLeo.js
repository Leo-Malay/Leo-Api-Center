const express = require("express");
const res_msg = require("./Function/res_msg");
const jwt_auth = require("./Function/request_auth").jwt_auth;
const db_method = require("./Function/db_method");
const ObjectId = require("mongodb").ObjectId;

const socialLeo = express.Router();
const db_user = "SocialUser";

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
                        username: req.token.data.username,
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
    if (req.body.user_id) {
        var user_id = req.body.user_id;
    } else {
        var user_id = req.token.data.uid;
    }
    db_method.Find(db_user, { uid: user_id, isDeleted: 0 }).then((result0) => {
        if (result0 === null) {
            res_msg.error(res, "No Such Account Found");
        } else if (result0.followers.indexOf(req.token.data.uid) !== -1) {
            res.status(200).json({
                uid: result0.uid,
                username: result0.username,
                followers: result0.followers,
                following: result0.following,
                posts: result0.posts,
                isVerified: result0.isVerified,
            });
        } else if (result0.uid === req.token.data.uid) {
            res.status(200).json(result0);
        } else {
            res.status(200).json({
                uid: result0.uid,
                username: result0.username,
                followers: result0.followers.length,
                following: result0.following.length,
                posts: result0.posts.length,
                isVerified: result0.isVerified,
            });
        }
    });
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
        db_method
            .InsertArray(
                db_user,
                { uid: req.body.user_id, isDeleted: 0 },
                { pendingFollowReq: req.token.data.uid }
            )
            .then((result0) => {
                if (result0.value !== null) {
                    res_msg.success(res, "Follow request sent!");
                } else {
                    res_msg.error(res, "Unable to complete your action");
                }
            });
    }
});
socialLeo.post("/unfollow", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
        db_method
            .RemoveArray(
                db_user,
                { uid: req.body.user_id, isDeleted: 0 },
                { followers: req.token.data.uid }
            )
            .then((result0) => {
                if (result0.value !== null) {
                    db_method
                        .RemoveArray(
                            db_user,
                            { uid: req.token.data.uid, isDeleted: 0 },
                            { following: req.body.user_id }
                        )
                        .then((result1) => {
                            if (result1.value !== null) {
                                res_msg.success(
                                    res,
                                    "User unfollowed Successfully"
                                );
                            } else {
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                } else {
                    res_msg.error(res, "Unable to complete your action");
                }
            });
    }
});
socialLeo.post("/accept_follow", jwt_auth, (req, res) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
        db_method
            .InsertArray(
                db_user,
                { uid: req.body.user_id, isDeleted: 0 },
                { following: req.token.data.uid }
            )
            .then((result0) => {
                if (result0.value !== null) {
                    db_method
                        .InsertArray(
                            db_user,
                            { uid: req.token.data.uid, isDeleted: 0 },
                            { followers: req.body.user_id }
                        )
                        .then((result0) => {
                            if (result0.value !== null) {
                                db_method
                                    .RemoveArray(
                                        db_user,
                                        {
                                            uid: req.token.data.uid,
                                            isDeleted: 0,
                                        },
                                        { pendingFollowReq: req.body.user_id }
                                    )
                                    .then((result1) => {
                                        if (result1.value !== null) {
                                            res_msg.success(
                                                res,
                                                "User started following you!"
                                            );
                                        } else {
                                            res_msg.error(
                                                res,
                                                "Unable to complete your action"
                                            );
                                        }
                                    });
                            } else {
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                } else {
                    res_msg.error(res, "Unable to complete your action");
                }
            });
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
            .InsertArray(
                db_user,
                {
                    uid: req.token.data.uid,
                    username: req.token.data.username,
                    isDeleted: 0,
                },
                {
                    posts: {
                        p_id: ObjectId(),
                        img_url: req.body.img_url,
                        likes: [],
                        comments: [],
                        date: Date.now(),
                    },
                }
            )
            .then((result0) => {
                if (result0.insertedCount != 0) {
                    res_msg.success(res, "Post Added Successfully");
                } else {
                    res_msg.res_error(res, "Something went wrong! Try again");
                }
            });
    }
});
socialLeo.post("/rm_post", jwt_auth, (req, res) => {
    if (!req.body.post_id) {
        res_msg.error(res, "Please provide post_id");
    } else {
        db_method
            .RemoveArray(
                db_user,
                {
                    uid: req.token.data.uid,
                    isDeleted: 0,
                },
                {
                    posts: {
                        p_id: ObjectId(req.body.post_id),
                    },
                }
            )
            .then((result0) => {
                if (result0.value !== null) {
                    res_msg.success(res, "Post deleted Successfully!");
                } else {
                    res_msg.error(res, "Unable to complete your action!");
                }
            });
    }
});
socialLeo.post("/like", jwt_auth, (req, res) => {
    if (!req.body.post_id || !req.body.user_id) {
        res_msg.error(res, "Please provide Post_Id");
    } else {
        db_method
            .Find(db_user, {
                uid: req.body.user_id,
                posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "No such post found!");
                } else {
                    if (
                        result0.posts[0].likes.indexOf(req.token.data.uid) ===
                        -1
                    ) {
                        db_method
                            .InsertArray(
                                db_user,
                                {
                                    uid: req.body.user_id,
                                    posts: {
                                        $elemMatch: {
                                            p_id: ObjectId(req.body.post_id),
                                        },
                                    },
                                    isDeleted: 0,
                                },
                                { "posts.$.likes": req.token.data.uid }
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
                                db_user,
                                {
                                    uid: req.body.user_id,
                                    posts: {
                                        $elemMatch: {
                                            p_id: ObjectId(req.body.post_id),
                                        },
                                    },
                                    isDeleted: 0,
                                },
                                { "posts.$.likes": req.token.data.uid }
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
    if (!req.body.post_id || !req.body.comment || !req.body.user_id) {
        res_msg.error(res, "Please provide post_id");
    } else {
        db_method
            .Find(db_user, {
                uid: req.body.user_id,
                posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "No such post found!");
                } else {
                    db_method
                        .InsertArray(
                            db_user,
                            {
                                uid: req.body.user_id,
                                posts: {
                                    $elemMatch: {
                                        p_id: ObjectId(req.body.post_id),
                                    },
                                },
                                isDeleted: 0,
                            },
                            {
                                "posts.$.comments": {
                                    c_id: ObjectId(),
                                    uid: req.token.data.uid,
                                    comment: req.body.comment,
                                },
                            }
                        )
                        .then((result1) => {
                            if (result1.value !== null) {
                                res_msg.success(
                                    res,
                                    "Comment added Successfully"
                                );
                            } else {
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                }
            });
    }
});
socialLeo.post("/rm_comment", jwt_auth, (req, res) => {
    if (!req.body.post_id || !req.body.c_id || !req.body.user_id) {
        res_msg.error(res, "Please provide post_id and c_id");
    } else {
        db_method
            .Find(db_user, {
                uid: req.body.user_id,
                posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
                isDeleted: 0,
            })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "No such post found!");
                } else {
                    db_method
                        .RemoveArray(
                            db_user,
                            {
                                uid: req.body.user_id,
                                posts: {
                                    $elemMatch: {
                                        p_id: ObjectId(req.body.post_id),
                                    },
                                },
                                isDeleted: 0,
                            },
                            {
                                "posts.$.comments": {
                                    c_id: ObjectId(req.body.c_id),
                                },
                            }
                        )
                        .then((result1) => {
                            if (result1.value !== null) {
                                res_msg.success(
                                    res,
                                    "Comment Removed Successfully"
                                );
                            } else {
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                }
            });
    }
});

module.exports = socialLeo;
/**
 * SocialUser : [uid, aboutMe:"", followers:[], following:[], posts:[], isVerified:0, isDeleted:0, pendingFollowReq:[]]
 * SocialPost : [uid, username, img_url, likes:[] comments:[], date, isDeleted:0]
 */
