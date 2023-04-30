var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// -----------------------------------
// Hashtags
// -----------------------------------
/* GET */
//---------
page.get("/hashtags", function (req, res) {
  var sql = "SELECT `hashtag` FROM tb_hashtag ORDER BY rand() LIMIT 8;";
  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("MySQL 可能語法寫錯了", err);
    } else {
      res.json(result);
    }
  });
});

module.exports = page;
