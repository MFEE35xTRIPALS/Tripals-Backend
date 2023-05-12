//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");
let userno;
// select
page.post("/cards/:authorno", function (req, res) {
  // userno = req.query.userno;
  // console.log(req.params);
  // console.log(req.body);
  var sql =
    "SELECT `articleno`,IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,`avatar`,`tb_main_article`.`userno`,`title`,`image`,`view_count`,(SELECT COUNT(*) FROM `tb_collect` WHERE `tb_collect`.`articleno` = `tb_main_article`.`articleno`) AS `like_count` FROM `tb_main_article` LEFT JOIN `tb_user` ON `tb_user`.`userno`=`tb_main_article`.`userno` WHERE `tb_main_article`.`userno`=? AND `tb_main_article`.`status`='show' ORDER BY `tb_main_article`.`articleno` DESC;"; //?接收使用這輸入資料
  var sql2 =
    "SELECT `intro`,`banner`,IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,`avatar` FROM `tb_user`  WHERE `userno`=?;"; //?接收使用這輸入資料
  var sql3 = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;"; //?接收登入者的id
  connhelper.query(
    sql + sql2 + sql3,
    [req.params.authorno, req.params.authorno, req.body.userno], //填入？的位置
    function (err, result, fields) {
      if (err) {
        res.status("select發生錯誤").send(err);
      } else {
        // console.log(result);
        let cardmessage = result[0];
        let authormessage = result[1];
        let usermessage = result[2].map((e) => e.articleno);
        res.json({
          cardmessage: cardmessage,
          authormessage: authormessage,
          usermessage: usermessage,
        });
        // console.log(result[2][0].collect.split(','));
      }
    }
  );
  // console.log(result[2][0].collect.split(','));
});
page.post("/deleteLikes", express.urlencoded(), function (req, res) {
  console.log(req.body);
  let sql = "DELETE FROM `tb_collect` WHERE `userno`=? AND `articleno`=?;";
  let sql2 =
    "SELECT COUNT(*) AS `like_count` FROM `tb_collect` WHERE `articleno` = ?;";
  connhelper.query(
    sql + sql2,
    [req.body.userno, req.body.articleno, req.body.articleno], //填入？的位置
    function (err, result, fields) {
      if (err) {
        res.status("deleteLikes發生錯誤").send(err);
      } else {
        // console.log(result);
        res.json({
          likesalert: "已取消收藏文章",
          likesCount: result[1][0].like_count,
        });
      }
    }
  );
});
page.post("/insertLikes", express.urlencoded(), function (req, res) {
  // console.log(req.body);
  let sql = "INSERT INTO `tb_collect`(`userno`, `articleno`) VALUES (?,?);";
  let sql2 =
    "SELECT COUNT(*) AS `like_count` FROM `tb_collect` WHERE `articleno` = ?;";
  connhelper.query(
    sql + sql2,
    [req.body.userno, req.body.articleno, req.body.articleno], //填入？的位置
    function (err, result, fields) {
      if (err) {
        res.status("insertLikes發生錯誤").send(err);
      } else {
        console.log(result[1][0].like_count);
        res.json({
          likesalert:
            "已將文章添加到我的收藏，可至個人頁面查看已被您收藏的文章",
          likesCount: result[1][0].like_count,
        });
      }
    }
  );
});

// ------已搬到瀏覽文章頁----------
// page.post("/updateViews", express.urlencoded(), function (req, res) {
//   // console.log(req.body);
//   let sql =
//     "UPDATE `tb_main_article` SET `view_count`=`view_count`+1 WHERE `articleno`=?;";
//   connhelper.query(
//     sql,
//     [req.body.articleno], //填入？的位置
//     function (err, result, fields) {
//       if (err) {
//         res.status("update發生錯誤").send(err);
//       } else {
//         res.end();
//       }
//     }
//   );
// });

module.exports = page;
