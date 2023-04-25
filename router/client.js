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
        cb(null, "public/useravatar");//保存的路徑(目的地)
    },
    filename: function (req, file, cb) {//編寫檔案名稱
        // console.log(userno);
        // var userFileName = Date.now() + '-' + file.originalname;//留下檔案戳記記錄歷程
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
    connhelper.query(sql, [('/useravatar/'+userno+'.'+req.files[0].originalname.split('.')[1]),userno], (err, results, fields) => {
        if (err) {
            res.send("MySQL 可能語法寫錯了", err);
        } else {
            // console.log(results);
            res.send('大頭貼修改完成');
        }
    });
});


//select
page.get('/avatar', function (req, res) {
    userno=req.query.userno;
    // console.log(userno);
    var sql = "SELECT avatar FROM `tb_user` WHERE userno=?; ";//?接收使用這輸入資料
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
