//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

// select
page.get('/cards', function (req, res) {
    var sqlall = "SELECT `collect` FROM  `tb_user` WHERE userno=2;";//?接收登入者的id
    var sql = "SELECT `intro`,`banner`,`articleno`,`nickname`,`avatar`,`tb_main_article`.`userno`,`title`,`image`,`view_count`,`like_count` FROM `tb_main_article` JOIN `tb_user` ON `tb_user`.`userno`=`tb_main_article`.`userno` WHERE `tb_main_article`.`userno`=3;";//?接收使用這輸入資料
    connhelper.query(sql+sqlall,
        [req.params.userno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                res.json(result);
                // console.log("done");

            }
        });

});

module.exports = page;