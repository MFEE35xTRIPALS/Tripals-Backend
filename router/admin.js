var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// -----------------------------------
// 最新消息
// -----------------------------------
/* GET */
//---------
page.get("/news", function (req, res) {
  var sql =
    "SELECT newsno,title, content, tb_news.status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`,SUBSTRING_INDEX(`id`, '@', 1)`userid` FROM `tb_news` INNER JOIN `tb_user` on tb_news.userno=tb_user.userno ORDER BY `release` DESC;";
  // "SELECT newsno,title, content, status, DATE_FORMAT(`release`, '%Y-%m-%d') `release`FROM `tb_news` ORDER BY `release` DESC;";
  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("<最新消息-渲染Get> MySQL 可能語法寫錯了", err);
    } else {
      res.json(result);
    }
  });
});
//---------
/* POST */
//---------
page.post("/news/post", express.urlencoded(), function (req, res) {
  console.log(req.body);
  var sql =
    "INSERT INTO `tb_news`(`userno`, `title`, `content`, `release`)  VALUES (1,?,?,?);";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // // 這邊userno 先固定1->屆時要回來調整
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release],
    function (err, results, fields) {
      if (err) {
        res.send("<最新消息-發布post>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

//---------
/* PUT */
//---------
page.put("/news/update", express.urlencoded(), function (req, res) {
  // console.log(req.body);
  var sql =
    "UPDATE `tb_news` SET `title`=?,`content`=?,`release`=?,date=now() WHERE `newsno`=?;";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.title, req.body.content, req.body.release, req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.send("<最新消息-更新put>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

//---------
/* DELETE */ //不刪除資料庫，僅是改變狀態
//---------
page.delete("/news/delete", express.urlencoded(), function (req, res) {
  // console.log(req.body);
  var sql = "UPDATE `tb_news` SET `status`=?, date=now() WHERE `newsno`=?;";
  var sqlAll =
    "SELECT newsno,title, content, DATE_FORMAT(`release`, '%Y-%m-%d') `date` FROM `tb_news`;";
  // console.log(sql);
  connhelper.query(
    sql + sqlAll,
    [req.body.status, req.body.newsno],
    function (err, results, fields) {
      if (err) {
        res.send("<最新消息-下架delete>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});

// -----------------------------------
// 會員管理
// -----------------------------------
/* GET */
//---------
page.get("/members", function (req, res) {
  var sqlAll =
    "SELECT `userno`,`permission`,  `id`, `password`,  `nickname`, `birthday`,  `status` ,DATE_FORMAT(`date`, '%Y-%m-%d') `date` FROM `tb_user`; ";
  var sqlusername =
    "SELECT  SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=?;";

  connhelper.query(
    sqlAll + sqlusername,
    [req.query.userno],
    function (err, result, fields) {
      if (err) {
        res.send("<會員管理-渲染get>MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    }
  );
});

//---------
/* PUT */
//---------
page.put("/members/update", express.urlencoded(), function (req, res) {
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
//---------
/* 文章管理 */
//---------
page.get('/manageArtilcles', function (req, res) {
  // console.log('kk');
  // res.send('done')
  let sql = 'SELECT `articleno`,`userno`,`title`,`report_count`,`status`,`date` FROM `tb_main_article` WHERE `report_count`!=0 ORDER BY `articleno` DESC;'
  connhelper.query(
    sql,
    [],
    function (err, results, fields) {
      if (err) {
        res.send("<文章管理-get>MySQL 可能語法寫錯了", err);
      } else {
        res.send(results);
      }
    }
  );
})

// 文章管理下架＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// update 文章狀態
page.put("/takeOf", express.urlencoded(), function (req, res) {
  var sql = "UPDATE `tb_main_article` SET `status`='report' WHERE `articleno`=?;";
  connhelper.query(
    sql,
    [req.body.articleno],
    function (err, results, fields) {
      if (err) {
        res.send("<會員管理-更新put>MySQL 可能語法寫錯了", err);
      } else {
        res.send(`${req.body.articleno}號文章已被刪除`);
      }
    }
  );
});

module.exports = page;
