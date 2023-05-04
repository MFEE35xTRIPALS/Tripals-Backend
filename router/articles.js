var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// -----------------------------------
// Hots
// -----------------------------------
/* POST */
//---------
page.post("/hots", express.urlencoded(), function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `like_count` DESC;";
  var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";

  connhelper.query(
    sql + sqllike,
    [req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.send("<HOT-熱門文章排序 Get>MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    }
  );
});
// -----------------------------------
// Views
// -----------------------------------
/* POST */
//---------
page.post("/views", express.urlencoded(), function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";

  connhelper.query(
    sql + sqllike,
    [req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.send("<HOT-熱門文章排序 Get>MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    }
  );
});
// -----------------------------------
// Hashtags
// -----------------------------------
/* GET */
//---------
page.get("/hashtags", function (req, res) {
  var sql =
    "SELECT `tb_hashtag`.`tagno`, `tb_hashtag`.`hashtag`, count(`tb_article_hashtag`.`hashtagno`) as `count` FROM `tb_hashtag` JOIN `tb_article_hashtag` ON `tb_hashtag`.`tagno` = `tb_article_hashtag`.`hashtagno` WHERE `tb_hashtag`.`status` = 'T' GROUP BY `tb_hashtag`.`tagno` ORDER BY `count`DESC LIMIT 8;";
  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("<hashtag-隨機8個渲染 Get>MySQL 可能語法寫錯了", err);
    } else {
      res.json(result);
    }
  });
});
// -----------------------------------
// Hashtags 被選中時，要顯示的文章
// -----------------------------------
/* POST */
//---------
page.post("/hashtags/:tagno", express.urlencoded(), function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count` FROM `tb_main_article` right JOIN `tb_article_hashtag` ON `tb_main_article`.`articleno` =`tb_article_hashtag`.`articleno` join `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno` where `tb_article_hashtag`.`hashtagno`=? AND `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";
  connhelper.query(
    sql + sqllike,
    [req.params.tagno, req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.send("<hashtag-選取之後POST> MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    }
  );
});
// -----------------------------------
// location 被選中時，要顯示的文章
// -----------------------------------
/* POST */
//---------
page.post("/city", express.urlencoded(), function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where `location`=? AND `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";
  connhelper.query(
    sql + sqllike,
    [req.body.city, req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.send("<city-選取之後POST> MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    }
  );
});

module.exports = page;
