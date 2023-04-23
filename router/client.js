//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

//select
page.get('/pokemon', function (req, res) {
    var sql = "SELECT avatar,nickname FROM `tb_user` WHERE userno=2; ";//?接收使用這輸入資料
    connhelper.query(sql,
        [],//填入？的位置
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