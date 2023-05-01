//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");
let userno;
// select
page.get('/cards', function (req, res) {
    userno = req.query.userno;
    var sql = "SELECT SUBSTRING_INDEX(`id`, '@', 1)`username`,`tb_main_article`.`date`,`articleno`,`nickname`,`avatar`,`tb_main_article`.`userno`,`title`,`image`,`view_count`,`like_count`,`tb_main_article`.`status` FROM `tb_main_article` LEFT JOIN `tb_user` ON `tb_user`.`userno`=`tb_main_article`.`userno` WHERE `tb_main_article`.`userno`=? ORDER BY `tb_main_article`.`date` DESC;"//?接收使用這輸入資料
    var sql2 = "SELECT SUBSTRING_INDEX(`id`, '@', 1)`username`,`intro`,`banner`,`nickname`,`avatar` FROM `tb_user`  WHERE `userno`=?;"//?接收使用這輸入資料
    var sql3 = "SELECT `collect` FROM  `tb_user` WHERE userno=?;";//?接收登入者的id
    connhelper.query(sql +sql2+ sql3,
        [req.query.authorno,req.query.authorno,userno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                // console.log(result);
                let cardmessage=result[0];
                let authormessage=result[1];
                let usermessage=result[2][0].collect?result[2][0].collect.split(','):null;
                res.json({cardmessage:cardmessage,authormessage:authormessage,usermessage:usermessage});
                // console.log(result[2][0].collect.split(','));

            }
        });

});
page.post('/updateLikes',express.urlencoded(), function (req, res){
    let sql="UPDATE tb_user SET `collect` = CASE WHEN `collect` LIKE ? THEN TRIM(BOTH ',' FROM REPLACE(REPLACE(`collect`, ? , ''),?, '')) ELSE CONCAT(`collect`, ?) END WHERE `userno` =?;";
    let sqlAll="SELECT `collect` FROM  `tb_user` WHERE userno=?;";
    // console.log(req.body);
    connhelper.query(sql+sqlAll,
        [`%${req.body.articleno}%`,`,${req.body.articleno}`,req.body.articleno,`,${req.body.articleno}`,req.body.userno,req.body.userno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                console.log(result);
                res.send(result[1][0].collect?result[1][0].collect.split(','):null);
                // console.log(result[1][0].collect);
            }
        });
})

module.exports = page;