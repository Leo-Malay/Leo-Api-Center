const db = require("../../db");

const Insert = (db_name, payload) => {
    return db.getDB().collection(db_name).insertOne(payload);
};
const InsertArray = (db_name, search_payload, payload) => {
    return db
        .getDB()
        .collection(db_name)
        .updateOne(search_payload, { $addToSet: payload });
};
const RemoveArray = (db_name, search_payload, payload) => {
    return db
        .getDB()
        .collection(db_name)
        .updateOne(search_payload, { $pull: payload }, { multi: false });
};
const Update = (db_name, search_payload, payload) => {
    return db
        .getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $set: payload });
};
const UpdateRaw = (db_name, search_payload, payload) => {
    return db
        .getDB()
        .collection(db_name)
        .findOneAndUpdate(search_payload, payload);
};
const Find = (db_name, payload) => {
    return db.getDB().collection(db_name).findOne(payload);
};
const FindAll = (db_name, payload) => {
    return db.getDB().collection(db_name).find(payload);
};

module.exports = {
    Insert,
    InsertArray,
    RemoveArray,
    Update,
    UpdateRaw,
    Find,
    FindAll,
};
