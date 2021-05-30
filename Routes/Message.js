const express = require("express");
const msg = express.Router();

msg.post("/send", (req, res) => {});
msg.get("/recieve", (req, res) => {});

module.exports = msg;
