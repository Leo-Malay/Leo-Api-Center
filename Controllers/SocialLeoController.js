const res_msg = require("../Utils/res_msg");
const db = require("../db");
const ObjectId = require("mongodb").ObjectId;
const { validationResult } = require("express-validator");
const db_user = "SocialUser";

const Register = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, { isDeleted: !1, uid: req.token.data.uid }).then(
        (result0) => {
            if (result0 !== null)
                return res_msg.success(res, "User already registered");
            db.Insert(db_user, {
                uid: req.token.data.uid,
                username: req.token.data.username,
                aboutMe: "",
                followers: [],
                following: [],
                posts: [],
                isVerified: !1,
                isDeleted: !1,
                pendingFollowReq: [],
            }).then((result1) => {
                if (result1.insertedCount !== 1)
                    return res_msg.error(
                        res,
                        "Unable to register you! Try Again Later"
                    );
                return res_msg.success(res, "User Registration Success");
            });
        }
    );
};
const Account = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    var user_id;
    if (req.body.user_id) {
        user_id = req.body.user_id;
    } else {
        user_id = req.token.data.uid;
    }
    db.Find(db_user, { uid: user_id, isDeleted: !1 }).then((result0) => {
        if (result0 === null)
            return res_msg.error(res, "No Such Account Found");
        if (result0.uid === req.token.data.uid)
            return res.status(200).json(result0);
        if (result0.followers.indexOf(req.token.data.uid) !== -1)
            return res.status(200).json({
                uid: result0.uid,
                username: result0.username,
                followers: result0.followers,
                following: result0.following,
                posts: result0.posts,
                isVerified: result0.isVerified,
            });
        return res.status(200).json({
            uid: result0.uid,
            username: result0.username,
            followers: result0.followers.length,
            following: result0.following.length,
            posts: result0.posts.length,
            isVerified: result0.isVerified,
        });
    });
};
const AboutMe = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Update(
        db_user,
        { uid: req.token.data.uid, isDeleted: !1 },
        {
            aboutMe: req.body.aboutMe,
        }
    ).then((result0) => {
        if (result0.value === null)
            return res_msg.error(res, "Unable to complete you action!");
        res_msg.success(res, "AboutMe Updated Successfully");
    });
};
const Follow = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    if (req.body.user_id === req.token.data.payload)
        return res_msg.success(res, "You are always following yourself :)");

    db.Find(db_user, { uid: req.token.data.uid, isDeleted: !1 }).then(
        (result0) => {
            if (result0.following.indexOf(req.body.user_id) !== -1) {
                res_msg.success(res, "You are already following!");
            } else {
                db.InsertArray(
                    db_user,
                    { uid: req.body.user_id, isDeleted: !1 },
                    { pendingFollowReq: req.token.data.uid }
                ).then((result0) => {
                    if (result0.value !== null)
                        return res_msg.success(res, "Follow request sent!");
                    res_msg.error(res, "Unable to complete your action");
                });
            }
        }
    );
};
const Unfollow = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    if (req.body.user_id === req.token.data.uid)
        return res_msg.success(res, "You can let yourself behind! :)");
    db.RemoveArray(
        db_user,
        { uid: req.body.user_id, isDeleted: !1 },
        { followers: req.token.data.uid }
    ).then((result0) => {
        if (result0.value === null)
            return res_msg.error(res, "Unable to complete your action");
        db.RemoveArray(
            db_user,
            { uid: req.token.data.uid, isDeleted: !1 },
            { following: req.body.user_id }
        ).then((result1) => {
            if (result1.value !== null)
                return res_msg.success(res, "User unfollowed Successfully");
            return res_msg.error(res, "Unable to complete your action");
        });
    });
};
const AcceptFollow = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, { uid: req.body.user_id, isDeleted: !1 }).then(
        (result0) => {
            if (result0 === null)
                return res_msg.error(res, "Unable to complete your action!");
            if (result0.following.indexOf(req.body.user_id) === -1)
                return res_msg.error(res, "No such request pending!");

            db.InsertArray(
                db_user,
                { uid: req.body.user_id, isDeleted: !1 },
                { following: req.token.data.uid }
            ).then((result0) => {
                if (result0.value === null)
                    return res_msg.error(res, "Unable to complete your action");
                db.InsertArray(
                    db_user,
                    {
                        uid: req.token.data.uid,
                        isDeleted: !1,
                    },
                    { followers: req.body.user_id }
                ).then((result0) => {
                    if (result0.value === null)
                        return res_msg.error(
                            res,
                            "Unable to complete your action"
                        );
                    db.RemoveArray(
                        db_user,
                        {
                            uid: req.token.data.uid,
                            isDeleted: !1,
                        },
                        {
                            pendingFollowReq: req.body.user_id,
                        }
                    ).then((result1) => {
                        if (result1.value !== null)
                            return res_msg.success(
                                res,
                                "User started following you!"
                            );
                        return res_msg.error(
                            res,
                            "Unable to complete your action"
                        );
                    });
                });
            });
        }
    );
};
const GetPost = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, { uid: req.token.data.uid, isDeleted: !1 }).then(
        (result0) => {
            db.FindAll(db_user, {
                uid: { $in: result0.following },
                isDeleted: !1,
            }).toArray((err, result1) => {
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
        }
    );
};
const Post = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.InsertArray(
        db_user,
        {
            uid: req.token.data.uid,
            username: req.token.data.username,
            isDeleted: !1,
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
    ).then((result0) => {
        if (result0.insertedCount != 0)
            return res_msg.success(res, "Post Added Successfully");
        return res_msg.error(res, "Something went wrong! Try again");
    });
};
const RemovePost = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.RemoveArray(
        db_user,
        {
            uid: req.token.data.uid,
            isDeleted: !1,
        },
        {
            posts: {
                p_id: ObjectId(req.body.post_id),
            },
        }
    ).then((result0) => {
        if (result0.value !== null)
            return res_msg.success(res, "Post deleted Successfully!");
        return res_msg.error(res, "Unable to complete your action!");
    });
};
const Like = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, {
        uid: req.body.user_id,
        posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
        isDeleted: !1,
    }).then((result0) => {
        if (result0 === null) return res_msg.error(res, "No such post found!");
        if (result0.posts[0].likes.indexOf(req.token.data.uid) === -1) {
            db.InsertArray(
                db_user,
                {
                    uid: req.body.user_id,
                    posts: {
                        $elemMatch: {
                            p_id: ObjectId(req.body.post_id),
                        },
                    },
                    isDeleted: !1,
                },
                { "posts.$.likes": req.token.data.uid }
            ).then((result1) => {
                if (result1.value !== null)
                    return res.status(200).json({
                        success: true,
                        msg: "Like added to the post",
                        color: 1,
                    });
                return res_msg.error(res, "Unable to complete your action");
            });
        } else {
            db.RemoveArray(
                db_user,
                {
                    uid: req.body.user_id,
                    posts: {
                        $elemMatch: {
                            p_id: ObjectId(req.body.post_id),
                        },
                    },
                    isDeleted: !1,
                },
                { "posts.$.likes": req.token.data.uid }
            ).then((result1) => {
                if (result1.value !== null)
                    return res.status(200).json({
                        success: true,
                        msg: "Like removed from the post",
                        color: 0,
                    });
                return res_msg.error(res, "Unable to complete your action");
            });
        }
    });
};
const AddComment = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, {
        uid: req.body.user_id,
        posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
        isDeleted: !1,
    }).then((result0) => {
        if (result0 === null) return res_msg.error(res, "No such post found!");
        db.InsertArray(
            db_user,
            {
                uid: req.body.user_id,
                posts: {
                    $elemMatch: {
                        p_id: ObjectId(req.body.post_id),
                    },
                },
                isDeleted: !1,
            },
            {
                "posts.$.comments": {
                    c_id: ObjectId(),
                    uid: req.token.data.uid,
                    comment: req.body.comment,
                },
            }
        ).then((result1) => {
            if (result1.value !== null)
                return res_msg.success(res, "Comment added Successfully");
            return res_msg.error(res, "Unable to complete your action");
        });
    });
};
const RemoveComment = (req, res, next) => {
    var error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    db.Find(db_user, {
        uid: req.body.user_id,
        posts: { $elemMatch: { p_id: ObjectId(req.body.post_id) } },
        isDeleted: !1,
    }).then((result0) => {
        if (result0 === null) return res_msg.error(res, "No such post found!");
        db.RemoveArray(
            db_user,
            {
                uid: req.body.user_id,
                posts: {
                    $elemMatch: {
                        p_id: ObjectId(req.body.post_id),
                    },
                },
                isDeleted: !1,
            },
            {
                "posts.$.comments": {
                    c_id: ObjectId(req.body.c_id),
                },
            }
        ).then((result1) => {
            if (result1.value !== null)
                return res_msg.success(res, "Comment Removed Successfully");
            return res_msg.error(res, "Unable to complete your action");
        });
    });
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
