const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const OId = require("mongodb").ObjectId.createFromHexString;
const config = require("config");
const mongoOption = { useNewUrlParser: !0, useUnifiedTopology: !0 };

const url = config.get("DB.URL");
const dbname = config.get("DB.NAME");

const state = { db: null };
const connect = (cb) => {
    state.db
        ? cb()
        : MongoClient.connect(url, mongoOption, (err, client) => {
              err ? cb(err) : ((state.db = client.db(dbname)), cb());
          });
};
const getID = (_id) => String(ObjectId(_id));
const getOID = (_id) => OId(String(_id));
const getDB = () => state.db;

module.exports = {
    getDB,
    connect,
    getID,
    getOID,
};
