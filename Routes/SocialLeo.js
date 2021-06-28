const express = require("express");
const res_msg = require("./Function/res_msg");
const jwt_auth = require("./Function/request_auth").jwt_auth;
const db_method = require("./Function/db_method");

const socialLeo = express.Router();
const db_user = "SocialUser";
const db_post = "SocialPost";

socialLeo.post("/register", jwt_auth, (req, res) => {
    db_method
        .Find(db_user, { isDeleted: 0, uid: req.token.data.uid })
        .then((result0) => {
            if (result0 == null) {
                res_msg.success(res, "User already registered");
            } else {
                db_method
                    .Insert(db_user, {
                        uid: req.token.payload,
                        aboutMe: "",
                        followers: [],
                        following: [],
                        posts: [],
                        isverified: 0,
                        isDeleted: 0,
                        pendingFollowReq: [],
                    })
                    .then((result1) => {
                        console.log(result1);
                        res_msg.success("User Registration Success");
                    });
            }
        });
});
socialLeo.get("/account", jwt_auth, (req, res) => {});
socialLeo.post("/about_me", jwt_auth, (req, res) => {});
socialLeo.post("/follow", jwt_auth, (req, res) => {});
socialLeo.post("/unfollow", jwt_auth, (req, res) => {});
socialLeo.get("/post", jwt_auth, (req, res) => {});
socialLeo.post("/post", jwt_auth, (req, res) => {});
socialLeo.post("/edit_post", jwt_auth, (req, res) => {});

module.exports = socialLeo;
/**
 * SocialUser : [uid, aboutMe:"", followers:[], following:[], posts:[], isVerified:0, isDeleted:0, pendingFollowReq:[]]
 *
 */
