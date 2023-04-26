// -----------------------------------
// 啟動伺服器 port 3000
// -----------------------------------
var express = require("express");
var app = express();
app.listen(3000, function (req, res) {
	console.log("Tripals: 啟動中");
});

// -----------------------------------
// 設定可存取資料名單
// -----------------------------------
var cors = require("cors");
// var setting = {
//   origin: ["http://locathost/"],
// };
app.use(cors());
app.use(express.static("./public"));

app.get("/", function (req, res) {
	res.send("okk");
});

// --------- 引用各分頁的CRUD -----------
var admin = require("./router/admin"); // 引用，相對路徑
app.use("/admin", admin); // 使用
// -----------------------------------
var members = require("./router/members"); // 引用，相對路徑
app.use("/members", members); // 使用
// -----------------------------------
var client = require("./router/client");
app.use("/client", client);
// -----------------------------------
var selfpage = require("./router/selfpage");
app.use("/selfpage", selfpage);
// // -----------------------------------
var client = require("./router/client-identity");
app.use("/client", client);
// -----------------------------------
var client = require("./router/guide");
app.use("/guide", client);
