const db = require("../../db");
const GetData = (db_name, payload) => {
    return db.getDB().collection(db_name).findOne();
};
const InsertData = (db_name, payload) => {
    return db.getDB().collection(db_name);
};
const RemoveData = (db_name, payload) => {
    return db.getDB().collection(db_name);
};
const FindData = (db_name, payload) => {
    db.getDB()
        .collection(db_name)
        .findOne(payload)
        .then((result0) => {
            if (result0) return true;
            else return false;
        })
        .catch((err) => {
            throw err;
        });
};

module.exports = {
    GetData,
    InsertData,
    RemoveData,
    FindData,
};
