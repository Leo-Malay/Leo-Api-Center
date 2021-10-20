const Router = require("express").Router;
const { body } = require("express-validator");
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
socialLeo.post("/about_me", body("aboutMe").notEmpty(), jwt_auth, AboutMe);
socialLeo.post("/follow", body("user_id").notEmpty(), jwt_auth, Follow);
socialLeo.post("/unfollow", body("user_id").notEmpty(), jwt_auth, Unfollow);
socialLeo.post(
    "/accept_follow",
    body("user_id").notEmpty(),
    jwt_auth,
    AcceptFollow
);
socialLeo.get("/post", jwt_auth, GetPost);
socialLeo.post("/post", body("img_url").notEmpty(), jwt_auth, Post);
socialLeo.post("/rm_post", body("post_id").notEmpty(), jwt_auth, RemovePost);
socialLeo.post(
    "/like",
    body("post_id").notEmpty(),
    body("user_id").notEmpty(),
    jwt_auth,
    Like
);
socialLeo.post(
    "/add_comment",
    body("post_id").notEmpty(),
    body("user_id").notEmpty(),
    body("comment").notEmpty(),
    jwt_auth,
    AddComment
);
socialLeo.post(
    "/rm_comment",
    jwt_auth,
    body("post_id").notEmpty(),
    body("user_id").notEmpty(),
    body("c_id").notEmpty(),
    RemoveComment
);

module.exports = socialLeo;
/**
 * SocialUser : [uid, aboutMe:"", followers:[], following:[], posts:[], isVerified:0, isDeleted:0, pendingFollowReq:[]]
 * SocialPost : [uid, username, img_url, likes:[] comments:[], date, isDeleted:0]
 */
