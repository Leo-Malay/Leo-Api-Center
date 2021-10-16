const Router = require("express").Router;
const jwt_auth = require("../Utils/request_auth").jwt_auth;
const {
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
} = require("../Controllers/SocialLeoController");
const socialLeo = Router();

socialLeo.post("/register", jwt_auth, Register);
socialLeo.get("/account", jwt_auth, Account);
socialLeo.post("/about_me", jwt_auth, AboutMe);
socialLeo.post("/follow", jwt_auth, Follow);
socialLeo.post("/unfollow", jwt_auth, Unfollow);
socialLeo.post("/accept_follow", jwt_auth, AcceptFollow);
socialLeo.get("/post", jwt_auth, GetPost);
socialLeo.post("/post", jwt_auth, Post);
socialLeo.post("/rm_post", jwt_auth, RemovePost);
socialLeo.post("/like", jwt_auth, Like);
socialLeo.post("/add_comment", jwt_auth, AddComment);
socialLeo.post("/rm_comment", jwt_auth, RemoveComment);

module.exports = socialLeo;
/**
 * SocialUser : [uid, aboutMe:"", followers:[], following:[], posts:[], isVerified:0, isDeleted:0, pendingFollowReq:[]]
 * SocialPost : [uid, username, img_url, likes:[] comments:[], date, isDeleted:0]
 */
