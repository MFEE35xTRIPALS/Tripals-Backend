// -----------------------------------
// 啟動伺服器 port 3000
// -----------------------------------
var express = require("express");
var app = express();

app.listen(8000, function (req, res) {
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------- swagger ---------
const swagger = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/docs", swagger.serve, swagger.setup(swaggerDocument));
// --------- 引用各分頁的CRUD -----------
/* 管理員後台 */
var admin = require("./router/admin"); // 引用，相對路徑
app.use("/admin", admin); // 使用
// -----------------------------------
/* 個人後台 */
var client = require("./router/client");
app.use("/client", client);
// -----------------------------------
/* 個人頁面-前台 */
var selfpage = require("./router/selfpage");
app.use("/selfpage", selfpage);
// -----------------------------------
/* 旅遊導覽頁-前台 */
var articles = require("./router/articles");
app.use("/articles", articles);
// -----------------------------------
var guide = require("./router/guide");
app.use("/guide", guide);
// test
