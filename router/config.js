// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var mysql = require("mysql");
var connhelper = mysql.createConnection({
  host: "192.3.80.70",
  port: 3306,
  user: "admin",
  password: "P@ssw0rd",
  database: "db_tripals",
  multipleStatements: true,
});
connhelper.connect(function (err) {
  if (err) {
    console.log("資料庫連線錯誤", err.sqlMessage);
  } else {
    console.log("資料庫連線成功");
  }
});
// --------------------匯出---------
module.exports = connhelper;
