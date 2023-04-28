var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------
//

// --------------- 這裡是個人資料讀取 --------------------
// 還未設定userno=6
/* GET */
// ---------------//
page.get("/identity", function (req, res) {
  // console.log(req.body.userno);
  var sql =
    "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=?;";

  connhelper.query(sql, [req.query.userno], function (err, result, fields) {
    if (err) {
      // console.log(req.body.userno);
      res.send("MySQL 可能語法寫錯了", err);
    } else {
      res.json(result);
    }
  });
});
//---------
/* POST */
//---------
page.post("/identity/update", express.urlencoded(), function (req, res) {
  // console.log(req.body.userno);
  // mysql 格式 date 要填空值時，要填null
  var birthday = req.body.birthday ? req.body.birthday : null;
  var sql =
    "UPDATE `tb_user` SET `id`=?,`password`=?,`nickname`=?,`birthday`=?, `intro`=?,date=now() WHERE `userno`=?;";

  var sqlAll =
    "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=? ;";
  console.log("req有抓到nickname" + req.body.nickname);
  console.log("req有抓到userno" + req.body.userno);
  console.log("req有抓到intro" + req.body.intro);
  console.log("req有抓到birthday" + birthday);
  connhelper.query(
    sql + sqlAll,
    [
      req.body.id,
      req.body.password,
      req.body.nickname,
      birthday,
      req.body.intro,
      req.body.userno,
      req.body.userno,
    ],
    function (err, results, fields) {
      if (err) {
        res.send("MySQL 可能語法寫錯了", err);
      } else {
        console.log("結果在這ㄌ裡");
        console.log(results[1]);
        res.json(results[1]);
      }
    }
  );
});
// --------------- 這裡是照片讀取 --------------------
// page.get("/img", function (req, res) {
//   res.sendFile(__dirname + "/p11.html");
// });
// //------------
// var bodyParser = require("body-parser");
// page.use(bodyParser.urlencoded()); // 全域變數
// // app.use(bodyParser.json());
// page.post("/avatar", function (req, res) {
//   console.log(req.body);
//   res.send("好好");
// });

module.exports = page;
