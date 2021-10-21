const express = require("express");
const dbConn = require("./db").connect;
const pathJoin = require("path").join;
const App = express();

// Configuring App
App.use(require("cookie-parser")());
App.set("trust proxy", 1);
App.use(
    require("express-session")({
        secret: "SomethingsGettingFishyIfYouAreSeeingThisCode",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, expires: 360000 },
    })
);
App.use(require("compression")());
App.use(require("cors")({ credentials: true }));
App.use(express.static(pathJoin(__dirname, "public")));
App.use(express.urlencoded({ extended: true }));
App.use(express.json());

// Configuring Routes
const Router = express.Router();
Router.get((req, res) => {
    res.sendFile(pathJoin(__dirname + "/public/index.html"));
});
Router.get("/login", (req, res) => {
    console.log(req.session);
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
