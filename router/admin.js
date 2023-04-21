var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 8889
// -----------------------------------
var mysql = require("mysql");
var connhelper = mysql.createConnection({
  host: "192.3.80.70",
  port: 3306,
  user: "admin",
  password: "P@ssw0rd",
  database: "db_test",
  multipleStatements: true,
});
connhelper.connect(function (err) {
  if (err) {
    console.log("資料庫連線錯誤", err.sqlMessage);
  } else {
    console.log("資料庫連線成功");
  }
});
// -----------------------------------

page.get("/", function (req, res) {
  var sql =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";

  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("select 發生錯誤", err);
    } else {
      res.json(result);
      //   res.json({ apple: 100, bee: 200, cat: 300, dog: 400 });
    }
  });
});

module.exports = page;
