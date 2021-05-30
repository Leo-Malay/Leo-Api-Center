const db = require("../../db");

const Insert = (db_name, payload) => {
    return db.getDB().collection(db_name).insertOne(payload);
};
const Remove = (db_name, payload) => {
    return db.getDB().collection(db_name);
};
const Find = (db_name, payload) => {
    return db.getDB().collection(db_name).findOne(payload);
};

module.exports = {
    Insert,
    Remove,
    Find,
};
