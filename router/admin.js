var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// -----------------------------------
// First Render 最新消息＋會員＋文章
// -----------------------------------
/* GET */
//---------
page.post("/", function (req, res) {
  var sqlNews =
    "SELECT newsno,title, content, tb_news.status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`,SUBSTRING_INDEX(`id`, '@', 1)`userno` FROM `tb_news` INNER JOIN `tb_user` on tb_news.userno=tb_user.userno ORDER BY `release` DESC;";
  var sqlMembers =
    "SELECT `userno`,`permission`,  `id`, `password`,  `nickname`, `birthday`,  `status` ,DATE_FORMAT(`date`, '%Y-%m-%d') `date` FROM `tb_user`; ";
  var sqlUsername =
    "SELECT  SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=?;";
  let sqlArticles =
    "SELECT `articleno`,`userno`,`title`,`report_count`,`status`,`date` FROM `tb_main_article` WHERE `report_count`!=0 ORDER BY `articleno` ASC;";

  connhelper.query(
    sqlNews + sqlMembers + sqlUsername + sqlArticles,
    [req.body.userno],
    function (err, result, fields) {
      if (err) {
        res.status("<FirstRender> MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(result);
      }
    }
  );
});

//---------
/* 最新消息-POST */
//---------
page.post("/news/post", function (req, res) {
  var sql =
    "INSERT INTO `tb_news`(`userno`, `title`, `content`, `release`)  VALUES (1,?,?,?);";
  var sqlAll =
    "SELECT newsno,title, content, tb_news.status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`,SUBSTRING_INDEX(`id`, '@', 1)`userno` FROM `tb_news` INNER JOIN `tb_user` on tb_news.userno=tb_user.userno ORDER BY `release` DESC;";

  // // 這邊userno 先固定1->屆時要回來調整
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release],
    function (err, results, fields) {
      if (err) {
        res.status("<最新消息-發布post>MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

//---------
/* 最新消息-PUT */
//---------
page.put("/news/update", function (req, res) {
  var sql =
    "UPDATE `tb_news` SET `title`=?,`content`=?,`release`=?,date=now() WHERE `newsno`=?;";
  var sqlAll =
    "SELECT newsno,title, content, tb_news.status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`,SUBSTRING_INDEX(`id`, '@', 1)`userno` FROM `tb_news` INNER JOIN `tb_user` on tb_news.userno=tb_user.userno ORDER BY `release` DESC;";

  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release, req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.status("<最新消息-更新put>MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

//---------
/* 最新消息-DELETE */ //不刪除資料庫，僅是改變狀態
//---------
page.delete("/news/delete", function (req, res) {
  console.log(req.body);

  var sql = "UPDATE `tb_news` SET `status`=?, date=now() WHERE `newsno`=?;";
  var sqlAll =
    "SELECT newsno,title, content, tb_news.status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`,SUBSTRING_INDEX(`id`, '@', 1)`userno` FROM `tb_news` INNER JOIN `tb_user` on tb_news.userno=tb_user.userno ORDER BY `release` DESC;";

  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.status, req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.status("<最新消息-下架delete>MySQL 可能語法寫錯了").send(err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

// -----------------------------------
// 會員管理
// -----------------------------------
/* PUT */
//---------
page.put("/members/update", function (req, res) {
  var sql = "UPDATE `tb_user` SET `id`=?,`password`=? WHERE `userno`=?;";
  var sqlAll =
    "SELECT `userno`, `id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`, `status`, DATE_FORMAT(`date`, '%Y-%m-%d')`date` FROM `tb_user`;";
  connhelper.query(
    sql + sqlAll,
    [req.body.id, req.body.password, req.body.userno],
    function (err, results, fields) {
      if (err) {
        res.send("<會員管理-更新put>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});
// -----------------------------------
// 文章管理下架
// -----------------------------------
/* PUT */
//---------
// update 文章狀態
page.put("/takeOf", function (req, res) {
  var sql =
    "UPDATE `tb_main_article` SET `status`='report' WHERE `articleno`=?;";
  var sqlAll =
    "SELECT `articleno`,`userno`,`title`,`report_count`,`status`,`date` FROM `tb_main_article` WHERE `report_count`!=0 ORDER BY `articleno` ASC;";
  connhelper.query(
    sql + sqlAll,
    [req.body.articleno],
    function (err, results, fields) {
      if (err) {
        res.send("<檢舉文章下架-更新put>MySQL 可能語法寫錯了", err);
      } else {
        res.send({
          myalert: `${req.body.articleno}號文章已被刪除`,
          myresult: results[1],
        });
      }
    }
  );
});

module.exports = page;
