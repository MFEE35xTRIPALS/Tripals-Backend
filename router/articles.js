var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// -----------------------------------
// Hots 熱門度排序
// -----------------------------------
/* POST */
//---------
page.get("/hots", function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `like_count` DESC;";
  // var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";

  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.status("<HOT-熱門文章排序 Get>MySQL 可能語法寫錯了").send(err);
    } else {
      res.json(result);
    }
  });
});
// -----------------------------------
// Views 瀏覽數排序
// -----------------------------------
/* POST */
//---------
page.get("/views", function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  // var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";

  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.status("<HOT-熱門文章排序 Get>MySQL 可能語法寫錯了").send(err);
    } else {
      res.json(result);
    }
  });
});
// -----------------------------------
// Hashtags 前8個顯示
// -----------------------------------
/* GET */
//---------
page.post("/", function (req, res) {
  var sqlA =
    "SELECT `tb_hashtag`.`tagno`, `tb_hashtag`.`hashtag`, count(`tb_article_hashtag`.`hashtagno`) as `count` FROM `tb_hashtag` JOIN `tb_article_hashtag` ON `tb_hashtag`.`tagno` = `tb_article_hashtag`.`hashtagno` WHERE `tb_hashtag`.`status` = 'T' GROUP BY `tb_hashtag`.`tagno` ORDER BY `count`DESC LIMIT 8;";
  var sqlB =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";

  connhelper.query(
    sqlA + sqlB + sqllike,
    [req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.status("<hashtag-8個 Get>MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(result);
      }
    }
  );
});
// -----------------------------------
// Hashtags 被選中時，要顯示的文章
// -----------------------------------
/* POST */
//---------
page.post("/hashtags/:tagno", function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count` FROM `tb_main_article` right JOIN `tb_article_hashtag` ON `tb_main_article`.`articleno` =`tb_article_hashtag`.`articleno` join `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno` where `tb_article_hashtag`.`hashtagno`=? AND `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  // var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";
  // console.log(req.params);
  // console.log(req.body);
  connhelper.query(sql, [req.params.tagno], function (err, result, fields) {
    if (err) {
      res.status("<hashtag-選取之後POST> MySQL 可能語法寫錯了").send(err);
    } else {
      // console.log(result[0]);
      // console.log(result[1]);
      res.json(result);
    }
  });
});
// -----------------------------------
// location 被選中時，要顯示的文章
// -----------------------------------
/* POST */
//---------
page.post("/city", function (req, res) {
  console.log(req.body);
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username` ,tb_main_article.`userno` , `title`,`image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where `location`=? AND `tb_main_article`.`status`='show' ORDER BY `view_count` DESC;";
  // var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";
  connhelper.query(sql, [req.body.city], function (err, result, fields) {
    if (err) {
      res.status("<city-選取之後POST> MySQL 可能語法寫錯了").send(err);
    } else {
      console.log(result);
      res.json(result);
    }
  });
});
// -----------------------------------
// searchbar 輸入關鍵字 要顯示的文章
// -----------------------------------
/* POST */
//---------
page.post("/search", function (req, res) {
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`,tb_main_article.`userno`, `title`,`content`,`location`, `image`,`avatar`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE tb_collect.articleno=tb_main_article.articleno)AS `like_count`  FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno`  where  `tb_main_article`.`status`='show' AND (tb_main_article.title LIKE ? OR location like ? OR content like ?) ORDER BY `like_count` DESC;";
  // var sqllike = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";
  connhelper.query(
    sql,
    [`%${req.body.search}%`, `%${req.body.search}%`, `%${req.body.search}%`],
    function (err, result, fields) {
      if (err) {
        res.status("<search bar-輸入之後POST> MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(result);
      }
    }
  );
});

module.exports = page;
