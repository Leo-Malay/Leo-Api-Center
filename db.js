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
const Insert = (db_name, payload) => {
    return getDB()
        .collection(db_name)
        .insertOne(payload)
        .catch((err) => {
            throw err;
        });
};
const InsertArray = (db_name, search_payload, payload) => {
    return getDB()
        .collection(db_name)
        .updateOne(search_payload, { $addToSet: payload }, { upsert: true })
        .catch((err) => {
            throw err;
        });
};
const RemoveArray = (db_name, search_payload, payload) => {
    return getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $pull: payload }, { multi: false })
        .catch((err) => {
            throw err;
        });
};
const Update = (db_name, search_payload, payload) => {
    return getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $set: payload })
        .catch((err) => {
            throw err;
        });
};
const UpdateRaw = (db_name, search_payload, payload) => {
    return getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, payload)
        .catch((err) => {
            throw err;
        });
};
const Find = (db_name, payload) => {
    return getDB()
        .collection(db_name)
        .findOne(payload)
        .catch((err) => {
            throw err;
        });
};
const FindAll = (db_name, payload) => {
    return getDB().collection(db_name).find(payload);
};
module.exports = {
    getDB,
    connect,
    getID,
    getOID,
    Insert,
    InsertArray,
    RemoveArray,
    Update,
    UpdateRaw,
    Find,
    FindAll,
};
