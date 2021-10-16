const res_msg = require("../Utils/res_msg");
const db_method = require("../Utils/db_method");
const ObjectId = require("mongodb").ObjectId;
const db_user = "SocialUser";

const Register = (req, res, next) => {
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
};
const Account = (req, res, next) => {
    if (req.body.user_id) {
        var user_id = req.body.user_id;
    } else {
        var user_id = req.token.data.uid;
    }
    db_method.Find(db_user, { uid: user_id, isDeleted: 0 }).then((result0) => {
        if (result0 === null) {
            res_msg.error(res, "No Such Account Found");
        } else if (result0.uid === req.token.data.uid) {
            res.status(200).json(result0);
        } else if (result0.followers.indexOf(req.token.data.uid) !== -1) {
            res.status(200).json({
                uid: result0.uid,
                username: result0.username,
                followers: result0.followers,
                following: result0.following,
                posts: result0.posts,
                isVerified: result0.isVerified,
            });
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
};
const AboutMe = (req, res, next) => {
    if (!req.body.aboutMe) {
        res_msg.error(res, "Please provide aboutMe");
    } else {
        db_method
            .Update(
                db_user,
                { uid: req.token.data.uid, isDeleted: 0 },
                {
                    aboutMe: req.body.aboutMe,
                }
            )
            .then((result0) => {
                if (result0.value === null) {
                    res_msg.error(res, "Unable to complete you action!");
                } else {
                    res_msg.success(res, "AboutMe Updated Successfully");
                }
            });
    }
};
const Follow = (req, res, next) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else if (req.body.user_id === req.token.data.payload) {
        res_msg.success(res, "You are always following yourself :)");
    } else {
        db_method
            .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
            .then((result0) => {
                if (result0.following.indexOf(req.body.user_id) !== -1) {
                    res_msg.success(res, "You are already following!");
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
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                }
            });
    }
};
const Unfollow = (req, res, next) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else if (req.body.user_id === req.token.data.uid) {
        res_msg.success(res, "You can let yourself behind! :)");
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
};
const AcceptFollow = (req, res, next) => {
    if (!req.body.user_id) {
        res_msg.error(res, "Please provide User_Id");
    } else {
        db_method
            .Find(db_user, { uid: req.body.user_id, isDeleted: 0 })
            .then((result0) => {
                if (result0 === null) {
                    res_msg.error(res, "Unable to complete your action!");
                } else if (result0.following.indexOf(req.body.user_id) === -1) {
                    res_msg.error(res, "No such request pending!");
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
                                        {
                                            uid: req.token.data.uid,
                                            isDeleted: 0,
                                        },
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
                                                    {
                                                        pendingFollowReq:
                                                            req.body.user_id,
                                                    }
                                                )
                                                .then((result1) => {
                                                    if (
                                                        result1.value !== null
                                                    ) {
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
                                res_msg.error(
                                    res,
                                    "Unable to complete your action"
                                );
                            }
                        });
                }
            });
    }
};
const GetPost = (req, res, next) => {
    db_method
        .Find(db_user, { uid: req.token.data.uid, isDeleted: 0 })
        .then((result0) => {
            db_method
                .FindAll(db_user, {
                    uid: { $in: result0.following },
                    isDeleted: 0,
                })
                .toArray((err, result1) => {
                    if (err) throw err;
                    var post_ls = [];
                    result1.map((ele) => {
                        ele.posts.forEach((element) => {
                            element.uid = ele.uid;
                        });
                        post_ls = post_ls.concat(ele.posts);
                    });
                    post_ls.sort((a, b) => {
                        return b.date - a.date;
                    });
                    res.status(200).json({ success: true, posts: post_ls });
                });
        });
};
const Post = (req, res, next) => {
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
};
const RemovePost = (req, res, next) => {
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
};
const Like = (req, res, next) => {
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
};
const AddComment = (req, res, next) => {
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
};
const RemoveComment = (req, res, next) => {
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
};

module.exports = {
    Register,
    AboutMe,
    AcceptFollow,
    Account,
    AddComment,
    RemoveComment,
    RemovePost,
    Like,
    Post,
    GetPost,
    Follow,
    Unfollow,
};
