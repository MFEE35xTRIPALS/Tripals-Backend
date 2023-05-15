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

app.use(cors());
app.use(express.static("./public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------
// 登入資料儲存
// -----------------------------------
const cookieSession = require("cookie-session");
const session = require("express-session");

app.use(
  cookieSession({
    name: "session",
    keys: ["lama"],
    maxAge: 10 * 1000, //24*60*60*100
  })
);

app.use(
  session({
    secret: "my secret key", // 用於加密會話ID的密鑰，可以自行替換
    resave: false,
    saveUninitialized: true,
    maxAge: 5 * 10000,
  })
);
// -----------------------------------
// 密碼加密？？？
// -----------------------------------
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

// --------- swagger ---------
const swagger = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/docs", swagger.serve, swagger.setup(swaggerDocument));
// --------- 引用各分頁的CRUD -----------
/* 首頁 */
var home = require("./router/home"); // 引用，相對路徑
app.use("/", home); // 使用
// -----------------------------------
/* 註冊 */
var router1 = require("./router/login/register"); // 引用，相對路徑
app.use("/", router1); // 使用
// -----------------------------------
/* 登入 */
var router2 = require("./router/login/login"); // 引用，相對路徑
app.use("/", router2); // 使用
// -----------------------------------
/* 第三方 */
const authRoute = require("./router/login/auth");
app.use("/auth", authRoute);
// -----------------------------------

// -----------------------------------
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
