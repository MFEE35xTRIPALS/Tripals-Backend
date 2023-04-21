// -----------------------------------
// 啟動伺服器 port 3000
// -----------------------------------
var express = require("express");
var app = express();
app.listen(3000, function (req, res) {
  console.log("天竺鼠車車: 啟動中");
});
// -----------------------------------
// 設定可存取資料名單
// -----------------------------------
var cors = require("cors");
// var setting = {
//   origin: ["http://locathost/"],
// };
app.use(cors());

// -----------------------------------
var admin = require("./router/admin"); // 引用，相對路徑
app.use("/news", admin); // 使用
// -----------------------------------
