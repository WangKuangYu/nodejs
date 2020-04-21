var mysql = require("mysql");

var db = mysql.createConnection({
     host :"localhost",
     user:"root",
     password:"",
     database:"aien07"
});

db.connect();

module.exports=db;