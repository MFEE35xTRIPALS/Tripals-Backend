var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("../config");
// -----------------------------------
// 密碼加密、解密
// -----------------------------------
var encryption = require("./encryption");
var decrypt = require("./decrypt");

// -----------------------------------
// 路由 : 登入頁面 POST
page.post("/logintest", (req, res) => {
  var sqlCheckUser = "SELECT COUNT(*) as count FROM tb_user WHERE id = ?";
  var sqlCheckPWD =
    "SELECT `password`,`userno`, `permission`,`avatar` FROM tb_user WHERE id = ?;";
  var sqlSendData =
    "SELECT `userno`, `permission`,`avatar` FROM tb_user WHERE id = ?;";
  console.log(req.body);
  connhelper.query(sqlCheckUser, [req.body.id], function (error, results) {
    //判斷是否有此帳號
    if (results[0].count === 0) {
      res.json({ message: "NoUser" });
    } else {
      connhelper.query(sqlCheckPWD, [req.body.id], function (error, results) {
        var pwdTest = results[0].password;
        var fnPwd = decrypt(req.body.password, pwdTest);

        if (!fnPwd) {
          res.json({ message: "WrongPwd" });
        } else {
          connhelper.query(
            sqlSendData,
            [req.body.id],
            function (error, results) {
              res.json({ message: "Success", currentuser: results });
            }
          );
        }
      });
    }
  });
});
// -----------------------------------
// 路由 : 註冊頁面 POST
page.post("/registertest", (req, res) => {
  var sqlselect = "SELECT userno FROM tb_user WHERE id = ?";
  var sqlinsert = "INSERT INTO tb_user (id,password) VALUES (?,?);";

  // 密碼加密
  var passwordHash = encryption(req.body.password);
  console.log(passwordHash);

  connhelper.query(sqlselect, [req.body.id], function (error, results) {
    //判斷是否有被註冊
    if (results[0]) {
      console.log("Email已存在");
      // 回傳message
      res.json({ message: "EmailExist" });
    } else {
      connhelper.query(
        sqlinsert,
        [req.body.id, passwordHash],
        function (err, result) {
          if (err) {
            res.status("<註冊(測試)> MySQL 可能語法寫錯了").send(err);
          } else {
            console.log("註冊成功");
            res.json({ message: "Success" });
          }
        }
      );
    }
  });
});

// -----------------------------------

module.exports = page;
