const express = require("express");
const helmet = require("helmet");
const db = require("./db");
const compression = require("compression");

const auth = require("./Routes/Auth");
const foodieLeo = require("./Routes/FoodieLeo");

const App = express();
App.use(compression());
App.use(helmet());
App.use(express.urlencoded({ extended: true }));
App.use("/Auth", auth);
App.use("/FoodieLeo", foodieLeo);

db.connect((err) => {
    if (err) throw err;
    App.listen(process.env.PORT || 8501, () => {
        console.log("[+] Serer has started");
    });
});
