var express = require("express");
var page = express.Router();
var multer = require("multer");
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------
//
// -----------------------------------
/* 處理圖檔 */
//---------
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "userHead"); // 保存的路徑，需手動建立檔案夾
  },
  filename: function (req, file, cb) {
    // // PDF作法，有時間戳記，適合用在要保存每次上傳的東西
    // var userFileName = Date.now() + "." + file.originalname.split(".")[1];
    // // 老師改編，適合用在: 使用者大頭照，id.副檔名，上傳新的直接覆蓋
    var userFileName = "6" + "." + file.originalname.split(".")[1];
    cb(null, userFileName);
  },
});

// 這是p20 ▽ 過濾檔案類型
var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype != "image/png") {
      return cb(new Error("檔案類型錯誤"));
    }
    cb(null, true);
  },
}); // 設置storage

// ------------------------------------

page.get("/", function (req, res) {
  //   res.send("測試用字串");
  var sql = "SELECT  `avatar` FROM `tb_user` WHERE userno=6;";

  connhelper.query(sql, [], function (err, result, fields) {
    if (err) {
      res.send("MySQL 可能語法寫錯了", err);
    } else {
      res.json(result[0]);
    }
  });
});

// ------------------------------------

page.post("/userHead", upload.single("userHead"), function (req, res) {
  console.log(req.file);
  console.log("原始檔名:", req.file.originalname);
  console.log("檔案類型:", req.file.mimetype);
  console.log("檔案大小:", req.file.size);
  console.log("檔案路徑:", req.file.path);
  res.send("上傳成功");
});
// ------------------------------------
module.exports = page;
