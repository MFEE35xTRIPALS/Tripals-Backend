//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

//處理圖檔
var multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + path.extname(file.originalname));
//     }
//   });
  
  // 創建 multer 實例
  const upload = multer({ dest: 'public/userno_2' });
// let path = require('path');
// page.use('/uploads',express.static(path.join(__dirname, 'userprofile')));

page.get('/',function(req,res){
console.log(__dirname);///Users/chenxin/Documents/GitHub/Tripals-Backend/router
// res.sendFile(__dirname+'/userprofile/userno_2/avator.png')
})
page.use('/public',express.static('public'));
//select
page.get('/avatar', function (req, res) {
    var sql = "SELECT avatar FROM `tb_user` WHERE userno=2; ";//?接收使用這輸入資料
    connhelper.query(sql,
        [req.params.userno],//填入？的位置
        function (err, result, fields) {
            if (err) {
                res.send('select發生錯誤', err);
            } else {
                // res.write(__dirname);
                res.json(result[0]);
                // res.json(__dirname);
                // console.log("done");

            }
        });

});

page.post('/upload', upload.single('shotUpload'), function(req, res) {
    console.log('okk');
    console.log(req);
    console.log('okk3');
    // console.log('Image uploaded:', req.file);
    // res.json({ url: `/uploads/${req.file}` });
  });
page.get('/',function(req,res){
    // res.send()
})

module.exports = page;
