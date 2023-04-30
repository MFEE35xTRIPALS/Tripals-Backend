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
    // console.log(res);
        let sql = `UPDATE tb_user SET avatar = ? WHERE userno = ?;`;
        let sqlAll="SELECT `avatar` FROM `tb_user` WHERE userno=?;"
        connhelper.query(sql+sqlAll, [('/useravatar/' + userno + '.' + req.files[0].originalname.split('.')[1]), userno,userno], (err, results, fields) => {
            if (err) {
                console.log("MySQL 可能語法寫錯了", err);
                res.send("伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。");
            } else {
                // console.log(results[1]);
                res.json({ myPhotoAlert: '大頭貼修改完成', avatarData: results[1][0] });
            }
        });
    
});
page.post('/uploadBanner', upload.array('shotUpload', 'userno'), function (req, res) {
    // console.log(req.files[0].originalname.split('.')[1]);
    // userno=req.body.userno;
    let sql = `UPDATE tb_user SET banner = ? WHERE userno = ?;`;
    let sqlAll="SELECT `banner` FROM `tb_user` WHERE userno=?;"
    connhelper.query(sql+sqlAll, [('/user_banner/' + userno + '.' + req.files[0].originalname.split('.')[1]), userno,userno], (err, results, fields) => {
        if (err) {
            console.log("MySQL 可能語法寫錯了", err);
            res.send("伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。");
        } else {
            // console.log(results);
            res.json({ myPhotoAlert: '封面照片修改完成', bannerData: results[1][0] });
        }
    });
});


// --------------- 這裡是個人資料讀取 --------------------
// 還未設定userno=6
/* GET */
// ---------------//
page.get("/identity", function (req, res) {
    // console.log(req.body.userno);
    userno = req.query.userno;
    var sql =
      "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username`,`avatar`,`banner` FROM `tb_user` WHERE userno=?;";
  
    connhelper.query(sql, [userno], function (err, result, fields) {
      if (err) {
        // console.log(req.body.userno);
        res.send("MySQL 可能語法寫錯了", err);
      } else {
        res.json(result);
      }
    });
  });
  //---------
  /* POST */
  //---------
  page.post("/identity/update", express.urlencoded(), function (req, res) {
    // console.log(req.body.userno);
    // mysql 格式 date 要填空值時，要填null
    var birthday = req.body.birthday ? req.body.birthday : null;
    var sql =
      "UPDATE `tb_user` SET `password`=?,`nickname`=?,`birthday`=?, `intro`=?,date=now() WHERE `userno`=?;";
  
    var sqlAll =
      "SELECT  `userno`,`id`, `password`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=? ;";
    // console.log("req有抓到nickname" + req.body.nickname);
    // console.log("req有抓到userno" + req.body.userno);
    // console.log("req有抓到intro" + req.body.intro);
    // console.log("req有抓到birthday" + birthday);
    connhelper.query(
      sql + sqlAll,
      [
        req.body.password,
        req.body.nickname,
        birthday,
        req.body.intro,
        req.body.userno,
        req.body.userno,
      ],
      function (err, results, fields) {
        if (err) {
          res.send("MySQL 可能語法寫錯了", err);
        } else {
          // console.log("結果在這ㄌ裡");
          // console.log(results[1]);
          res.json(results[1]);
        }
      }
    );
  });
module.exports = page;
