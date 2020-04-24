var mysql = require("mysql");
const bluebird = require('bluebird');

var db = mysql.createConnection({
     host :"localhost",
     user:"root",
     password:"",
     database:"aien07"
});

db.connect();

bluebird.promisifyAll(db);
module.exports=db;