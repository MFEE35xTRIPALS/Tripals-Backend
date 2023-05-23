//連線伺服器
var express = require("express");
var page = express.Router();
// 連線資料庫
var connhelper = require("./config");

// 密碼加密
var encryption = require("./login_test/encryption");

//處理圖檔
var multer = require("multer");
let photono;

var mystorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.route.path);// '/uploadBanner'或'/upload'
    if (req.route.path == "/upload") {
      cb(null, "public/useravatar");
    } else if (req.route.path == "/uploadBanner") {
      cb(null, "public/user_banner");
      // console.log('okkkk')
    } //保存的路徑(目的地)
  },
  filename: function (req, file, cb) {
    //編寫檔案名稱
    var userFileName = photono + "." + file.originalname.split(".")[1]; //留下自己可辨別的檔案
    cb(null, userFileName);
    // console.log(file)
  },
});
let upload = multer({
  storage: mystorage,
  fileFilter: function (req, file, cb) {
    // console.log('apple:'+JSON.stringify(req));
    // console.log('apple:'+JSON.stringify(file));
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
      // console.log(req)
    } else {
      return cb(new Error("上傳檔案類型錯誤"));
    }
  },
});

page.post(
  "/upload",
  upload.single("shotUpload", "userno"),
  function (req, res) {
    // console.log(req.files[0].originalname.split('.')[1]);
    // userno=req.body.userno;
    // console.log(res);
    let sql = `UPDATE tb_user SET avatar = ? WHERE userno = ?;`;
    let sqlAll = "SELECT `avatar` FROM `tb_user` WHERE userno=?;";
    connhelper.query(
      sql + sqlAll,
      [
        "/useravatar/" +
          req.body.userno +
          "." +
          req.file.originalname.split(".")[1],
        req.body.userno,
        req.body.userno,
      ],
      (err, results, fields) => {
        if (err) {
          console.log("MySQL 可能語法寫錯了", err);
          res.send(
            "伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。"
          );
        } else {
          // console.log(results[1]);
          res.json({
            myPhotoAlert: "大頭貼修改完成",
            avatarData: results[1][0],
          });
        }
      }
    );
  }
);
page.post("/uploadBanner", upload.single("shotUpload"), function (req, res) {
  // console.log(req);
  // console.log(req.body.userno);
  // console.log(req.files[0].originalname.split('.')[1]);
  let sql = `UPDATE tb_user SET banner = ? WHERE userno = ?;`;
  let sqlAll = "SELECT `banner` FROM `tb_user` WHERE userno=?;";
  connhelper.query(
    sql + sqlAll,
    [
      "/user_banner/" +
        req.body.userno +
        "." +
        req.file.originalname.split(".")[1],
      req.body.userno,
      req.body.userno,
    ],
    (err, results, fields) => {
      if (err) {
        console.log("MySQL 可能語法寫錯了", err);
        res.send(
          "伺服端發生錯誤，檔案上傳失敗，請稍後再試。如持續無法上傳請聯繫客服。"
        );
      } else {
        // console.log(results);
        res.json({
          myPhotoAlert: "封面照片修改完成",
          bannerData: results[1][0],
        });
      }
    }
  );
});

// --------------- 這裡是個人資料讀取 --------------------
/* GET */
// ---------------//
page.post("/identity", function (req, res) {
  // console.log(req.body.userno);
  photono = req.body.userno;
  var sql =
    "SELECT  `userno`,`id`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username`,`avatar`,`banner` FROM `tb_user` WHERE userno=?;";
  var sql2 =
    "SELECT `tb_main_article`.`articleno`, IFNULL(tb_user.nickname, SUBSTRING_INDEX(`tb_user`.`id`, '@', 1)) AS `username`, `avatar`, `tb_main_article`.`userno`, `title`, `image`, `view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE `tb_collect`.`articleno` = `tb_main_article`.`articleno`) AS `like_count` FROM `tb_main_article` LEFT JOIN `tb_user` ON `tb_user`.`userno` = `tb_main_article`.`userno` LEFT JOIN ( SELECT `tb_collect`.`articleno`, `date` FROM `tb_collect` WHERE `tb_collect`.`userno` = ? ) AS `subquery` ON `tb_main_article`.`articleno` = `subquery`.`articleno` WHERE `tb_main_article`.`articleno` IN ( SELECT `tb_collect`.`articleno` FROM `tb_collect` WHERE `tb_collect`.`userno` = ? ) AND `tb_main_article`.`status` = 'show' ORDER BY `subquery`.`date` DESC;";
  var sql3 =
    "SELECT `articleno`, `title`,`view_count`, (SELECT COUNT(*) FROM `tb_collect` WHERE `tb_collect`.`articleno` = `tb_main_article`.`articleno`) AS `count`,`tb_main_article`.`status`,tb_main_article.add_date FROM `tb_main_article` WHERE `tb_main_article`.`userno` = ? ORDER BY `tb_main_article`.`add_date` DESC;";

  connhelper.query(
    sql + sql2 + sql3,
    [req.body.userno, req.body.userno, req.body.userno, req.body.userno],
    function (err, result, fields) {
      if (err) {
        // console.log(req.body.userno);
        res.status("<個人資料-渲染get>MySQL 可能語法寫錯了").send(err);
      } else {
        // console.log(result[2])
        res.json({
          userMessage: result[0],
          userLikes: result[1],
          selfarticles: result[2],
        });
      }
    }
  );
});
//---------
/* POST */
//---------
// 沒改密碼
page.post("/identity/update1", function (req, res) {
  // console.log(req.body);
  var birthday = req.body.birthday ? req.body.birthday : null;
  var sql =
    "UPDATE `tb_user` SET `nickname`=?,`birthday`=?, `intro`=?,date=now() WHERE `userno`=?;";

  var sqlAll =
    "SELECT  `userno`,`id`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=? ;";
  connhelper.query(
    sql + sqlAll,
    [
      req.body.nickname,
      birthday,
      req.body.intro,
      req.body.userno,
      req.body.userno,
    ],
    function (err, results, fields) {
      if (err) {
        res.send("<個人資料(不含密碼)-更新post>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});
// 有改密碼
page.post("/identity/update2", function (req, res) {
  // console.log(req.body);
  var birthday = req.body.birthday ? req.body.birthday : null;
  var sql =
    "UPDATE `tb_user` SET `password`=?,`nickname`=?,`birthday`=?, `intro`=?,date=now() WHERE `userno`=?;";

  var sqlAll =
    "SELECT  `userno`,`id`, `nickname`, DATE_FORMAT(`birthday`, '%Y-%m-%d')`birthday`, `intro`,SUBSTRING_INDEX(`id`, '@', 1)`username` FROM `tb_user` WHERE userno=? ;";

  // 密碼加密
  var passwordHash = encryption(req.body.password);
  // var passwordHash = req.body.password;

  connhelper.query(
    sql + sqlAll,
    [
      passwordHash,
      req.body.nickname,
      birthday,
      req.body.intro,
      req.body.userno,
      req.body.userno,
    ],
    function (err, results, fields) {
      if (err) {
        res.send("<個人資料-更新post>MySQL 可能語法寫錯了", err);
      } else {
        res.json(results[1]);
      }
    }
  );
});
module.exports = page;
