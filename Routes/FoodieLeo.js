const Router = require("express").Router;
const jwt_auth = require("../Utils/request_auth").jwt_auth;
const {
    GetCart,
    PostCart,
    Menu,
    Order,
} = require("../Controllers/FoodieLeoController");
const foodieLeo = Router();

foodieLeo.get("/cart", jwt_auth, GetCart);
foodieLeo.post("/cart", jwt_auth, PostCart);
foodieLeo.get("/menu", Menu);
foodieLeo.post("/order", jwt_auth, Order);

module.exports = foodieLeo;
