const express = require("express");
var page = express.Router();

var mysqlConn = require("../config");

page.post("/register2", express.urlencoded(), (req, res) => {
  // console.log('done');
  // console.log(req.body);
  // if([req.body.password] === [req.body.password2]){
  //     conso
  // }

  const sqlselect = "SELECT * FROM tb_user WHERE id = ?";
  const sqlinsert = "INSERT INTO tb_user (id,password) VALUES (?,?);";

  mysqlConn.query(
    sqlselect,
    [req.body.id, req.body.password, req.body.password2],
    function (error, results) {
      //判斷密碼二次輸入
      if (req.body.password !== req.body.password2) {
        console.log("輸入的密碼不一致請重新輸入");
        return res.send("輸入的密碼不一致請重新輸入");
      }
      //判斷是否有被註冊
      if (results.length > 0) {
        console.log("已經被註冊");
        return res.json();
      } else {
        mysqlConn.query(
          sqlinsert,
          [req.body.id, req.body.password],
          function (err, results) {
            if (err) {
              console.error("DB error:", err);
            } else {
              console.log("註冊成功");
              res.end();
            }
          }
        );
      }
    }
  );
});

module.exports = page;
