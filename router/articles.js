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
  var sql =
    "SELECT `tagno`, `hashtag`, `status` FROM tb_hashtag WHERE `status` = 'T' ORDER BY rand() LIMIT 8;";
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
/* GET */
//---------

page.get("/hashtags/:tagno", function (req, res) {
  console.log("皮卡丘是" + req.params.tagno);
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`, `view_count`, `like_count` FROM `tb_main_article` right JOIN `tb_article_hashtag` ON `tb_main_article`.`articleno` =`tb_article_hashtag`.`articleno` join `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno` where `tb_article_hashtag`.`hashtagno`=? AND `tb_main_article`.`status`='show';";
  connhelper.query(sql, [req.params.tagno], function (err, result, fields) {
    if (err) {
      res.send("<hashtag-選取之後Get> MySQL 可能語法寫錯了", err);
    } else {
      // console.log(result);
      res.json(result);
    }
  });
});
// -----------------------------------
// location 被選中時，要顯示的文章
// -----------------------------------
/* GET */
//---------

page.get("/city", function (req, res) {
  console.log(req.query.city);
  var sql =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS`username`, `title`, `view_count`, `like_count` FROM `tb_main_article` right JOIN `tb_user` on `tb_user`.`userno`=`tb_main_article`.`userno` where `location`='?' AND `tb_main_article`.`status`='show';";
  connhelper.query(sql, ["台中市"], function (err, result, fields) {
    if (err) {
      res.send("<hashtag-選取之後Get> MySQL 可能語法寫錯了", err);
    } else {
      console.log(result);
      res.json(result);
    }
  });
});

module.exports = page;
