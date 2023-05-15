var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------
// -----------------------------------
// First Render 最新消息(上架＋今天以前)＋熱門度＋瀏覽數
// -----------------------------------
/* GET */
//---------
page.get("/", function (req, res) {
  var sqlNews =
    "SELECT title, content, DATE_FORMAT(`release`, '%Y/%m/%d') `release` FROM `tb_news` WHERE tb_news.status='T' AND `release`<= CURRENT_DATE() ORDER BY `release` DESC LIMIT 3;"
  let sqlLikes =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `like_count` DESC LIMIT 3;";
  let sqlViews =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `view_count` DESC LIMIT 10;";

  connhelper.query(
    sqlNews + sqlLikes + sqlViews,
    [],
    function (err, result, fields) {
      if (err) {
        res.status("<Home> MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(result);
      }
    }
  );
});

module.exports = page;
