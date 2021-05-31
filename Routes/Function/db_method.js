const db = require("../../db");

const Insert = (db_name, payload) => {
    return db.getDB().collection(db_name).insertOne(payload);
};
const Update = (db_name, search_payload, payload) => {
    return db
        .getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $set: payload });
};
const Find = (db_name, payload) => {
    return db.getDB().collection(db_name).findOne(payload);
};

module.exports = {
    Insert,
    Update,
    Find,
};
