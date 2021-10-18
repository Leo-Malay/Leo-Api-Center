const express = require("express");
const dbConn = require("./db").connect;
const pathJoin = require("path").join;
const cors = require("cors");
const compression = require("compression");
const App = express();

// Configuring App
App.use(compression());
App.use(cors());
App.use(express.static(pathJoin(__dirname, "public")));
App.use(express.urlencoded({ extended: true }));
App.use(express.json());

// Configuring Routes
const Router = express.Router();
Router.get((req, res) => {
    res.sendFile(pathJoin(__dirname + "/public/index.html"));
});
Router.get("/login", (req, res) => {
    res.sendFile(pathJoin(__dirname + "/public/Login.html"));
});
Router.get("/newAccount", (req, res) => {
    res.sendFile(pathJoin(__dirname + "/public/NewAccount.html"));
});
App.use("/", Router);
App.use("/Auth", require("./Routes/Auth"));
App.use("/FoodieLeo", require("./Routes/FoodieLeo"));
App.use("/LeoBank", require("./Routes/LeoBank"));
App.use("/LeoSocial", require("./Routes/SocialLeo"));

dbConn((err) => {
    if (err) throw err;
    App.listen(process.env.PORT || 8501, () => {
        console.log("[+] Server has started", process.env.PORT || 8501);
    });
});
