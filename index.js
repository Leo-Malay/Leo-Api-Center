const express = require("express");
const db = require("./db");
const compression = require("compression");

const auth = require("./Routes/Auth");

const App = express();
App.use(compression());
App.use(express.static("public"));
App.use(express.urlencoded({ extended: true }));

App.use("/Auth", auth);

db.connect((err) => {
    if (err) throw err;
    App.listen(8080 || process.env.PORT, () => {
        console.log("[+] Serer has started");
    });
});
