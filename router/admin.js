var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------
//
// -----------------------------------
/* GET */
//---------
page.get("/", function (req, res) {
  var sql =
    "SELECT newsno,title, content, status,DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";

  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("MySQL 可能語法寫錯了", err);
    } else {
      res.json(result);
    }
  });
});
//---------
/* POST */
//---------
page.post("/post", express.urlencoded(), function (req, res) {
  console.log(req.body);
  var sql =
    "INSERT INTO `tb_news`(`userno`, `title`, `content`, `release`)  VALUES (1,?,?,?);";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // // 這邊userno 先固定1->屆時要回來調整
  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release],
    function (err, results, fields) {
      if (err) {
        res.send("MySQL 可能語法寫錯了", err);
      } else {
        console.log(results[0]);
        res.json(results[1]);
      }
    }
  );
});

//---------
/* UPDATE */
//---------
page.post("/update", express.urlencoded(), function (req, res) {
  console.log(req.body);
  var sql =
    "UPDATE `tb_news` SET `title`=?,`content`=?,`release`=?,date=now() WHERE `newsno`=?;";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // // 這邊userno 先固定1->屆時要回來調整
  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release, req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.send("MySQL 可能語法寫錯了", err);
      } else {
        console.log(results);
        res.json(results[1]);
      }
    }
  );
});

//---------
/* DELETE */ //要刪除資料庫，還是改變狀態
//---------
page.post("/delete", express.urlencoded(), function (req, res) {
  console.log(req.body);
  // var sql =
  //   "UPDATE `tb_news` SET `status`=?, date=now() WHERE `newsno`=?;";
  var sql = "DELETE FROM `tb_news` WHERE newsno = ?;";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // // 這邊userno 先固定1->屆時要回來調整
  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.send("MySQL 可能語法寫錯了", err);
      } else {
        console.log(results[0]);
        res.json(results[1]);
      }
    }
  );
});

module.exports = page;
