//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

let userno;

//處理圖檔
var multer = require('multer');
var mystorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log(req.route.path);// '/uploadBanner'或'/upload'
        if (req.route.path == '/upload') {
            cb(null, "public/useravatar")
        } else if (req.route.path == '/uploadBanner') {
            cb(null, "public/user_banner")
        };//保存的路徑(目的地)
    },
    filename: function (req, file, cb) {//編寫檔案名稱
        var userFileName = userno + '.' + file.originalname.split('.')[1];//留下自己可辨別的檔案
        cb(null, userFileName);
    }
})
let upload = multer({
    storage: mystorage,
    fileFilter: function (req, file, cb) {
        // console.log('apple:'+JSON.stringify(req));
        // console.log('apple:'+JSON.stringify(file));
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/gif') {
            cb(null, true)
        } else {
            return cb(new Error('上傳檔案類型錯誤'))
        }
    }
});

page.post('/upload', upload.array('shotUpload', 'userno'), function (req, res) {
    // console.log(req.files[0].originalname.split('.')[1]);
    // userno=req.body.userno;
        let sql = `UPDATE tb_user SET avatar = ? WHERE userno = ?;`;
        connhelper.query(sql, [('/useravatar/' + userno + '.' + req.files[0].originalname.split('.')[1]), userno], (err, results, fields) => {
            if (err) {
                console.log("MySQL 可能語法寫錯了", err);
                res.send("伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。");
            } else {
                // console.log(results);
                res.send('大頭貼修改完成');
            }
        });
    
});
page.post('/uploadBanner', upload.array('shotUpload', 'userno'), function (req, res) {
    // console.log(req.files[0].originalname.split('.')[1]);
    // userno=req.body.userno;
    let sql = `UPDATE tb_user SET banner = ? WHERE userno = ?;`;
    connhelper.query(sql, [('/user_banner/' + userno + '.' + req.files[0].originalname.split('.')[1]), userno], (err, results, fields) => {
        if (err) {
            res.send("MySQL 可能語法寫錯了", err);
        } else {
            // console.log(results);
            res.send('封面照片修改完成');
        }
    });
});


//select
page.get('/avatar', function (req, res) {
    userno = req.query.userno;
    // console.log(userno);
    var sql = "SELECT `avatar`,`banner` FROM `tb_user` WHERE userno=?; ";//?接收使用這輸入資料
    connhelper.query(sql,
        [userno],//填入2的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                // console.log('done');
                res.json(result[0]);
            }
        });

});

module.exports = page;
