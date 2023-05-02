//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");
let userno;
// select
page.get('/cards', function (req, res) {
    // console.log(req.query.userno);
    // userno = req.query.userno;
    var sql = "SELECT SUBSTRING_INDEX(`id`, '@', 1)`username`,`tb_main_article`.`date`,`articleno`,`nickname`,`avatar`,`tb_main_article`.`userno`,`title`,`image`,`view_count`,`like_count` FROM `tb_main_article` LEFT JOIN `tb_user` ON `tb_user`.`userno`=`tb_main_article`.`userno` WHERE `tb_main_article`.`userno`=? AND `tb_main_article`.`status`='show' ORDER BY `tb_main_article`.`date` DESC;"//?接收使用這輸入資料
    var sql2 = "SELECT SUBSTRING_INDEX(`id`, '@', 1)`username`,`intro`,`banner`,`nickname`,`avatar` FROM `tb_user`  WHERE `userno`=?;"//?接收使用這輸入資料
    var sql3 = "SELECT `articleno` FROM `tb_collect` WHERE `userno`=?;";//?接收登入者的id
    connhelper.query(sql + sql2 + sql3,
        [req.query.authorno, req.query.authorno, req.query.userno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                // console.log(result);
                let cardmessage = result[0];
                let authormessage = result[1];
                let usermessage = result[2];
                res.json({ cardmessage: cardmessage, authormessage: authormessage, usermessage: usermessage });
                // console.log(result[2][0].collect.split(','));

            }
        });

});
page.post('/deleteLikes', express.urlencoded(), function (req, res) {
    console.log(req.body)
    let sql = "DELETE FROM `tb_collect` WHERE `userno`=? AND `articleno`=?;";
    connhelper.query(sql,
        [req.body.userno, req.body.articleno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('delete發生錯誤', err);
            } else {
                console.log(result)
                res.send('已取消收藏文章');
            }
        })
});
page.post('/insertLikes', express.urlencoded(), function (req, res) {
    let sql = "INSERT INTO `tb_collect`(`userno`, `articleno`) VALUES (?,?);"
    connhelper.query(sql,
        [req.body.userno, req.body.articleno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('update發生錯誤', err);
            } else {
                res.send('已將文章添加到我的收藏，可至個人頁面查看已被您收藏的文章');
            }
        })
});

module.exports = page;