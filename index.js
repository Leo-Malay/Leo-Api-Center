const express = require("express");
const helmet = require("helmet");
const db = require("./db");
const compression = require("compression");
const path = require("path");

const auth = require("./Routes/Auth");
const foodieLeo = require("./Routes/FoodieLeo");
const leoBank = require("./Routes/LeoBank");
const socialLeo = require("./Routes/SocialLeo");

const App = express();
App.use(compression());
App.use(helmet());
App.use(express.static("public"));
App.use(express.json());
App.use(express.urlencoded({ extended: true }));

App.use("/Auth", auth);
App.use("/FoodieLeo", foodieLeo);
App.use("/LeoBank", leoBank);
App.use("/LeoSocial", socialLeo);
App.use("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

db.connect((err) => {
    if (err) throw err;
    App.listen(process.env.PORT || 8501, () => {
        console.log("[+] Server has started", process.env.PORT || 8501);
    });
});
