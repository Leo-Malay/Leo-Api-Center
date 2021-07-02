const db = require("../../db").getDB;

const Insert = (db_name, payload) => {
    return db()
        .collection(db_name)
        .insertOne(payload)
        .catch((err) => {
            throw err;
        });
};
const InsertArray = (db_name, search_payload, payload) => {
    return db()
        .collection(db_name)
        .updateOne(search_payload, { $addToSet: payload })
        .catch((err) => {
            throw err;
        });
};
const RemoveArray = (db_name, search_payload, payload) => {
    return db()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $pull: payload }, { multi: false })
        .catch((err) => {
            throw err;
        });
};
const Update = (db_name, search_payload, payload) => {
    return db()
        .collection(db_name)
        .findOneAndUpdate(search_payload, { $set: payload })
        .catch((err) => {
            throw err;
        });
};
const UpdateRaw = (db_name, search_payload, payload) => {
    return db()
        .collection(db_name)
        .findOneAndUpdate(search_payload, payload)
        .catch((err) => {
            throw err;
        });
};
const Find = (db_name, payload) => {
    return db()
        .collection(db_name)
        .findOne(payload)
        .catch((err) => {
            throw err;
        });
};
const FindAll = (db_name, payload) => {
    return db().collection(db_name).find(payload);
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
