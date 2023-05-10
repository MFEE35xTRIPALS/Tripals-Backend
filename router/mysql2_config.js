// 引用 mysql2 - mysql2可使用promise方式達成非同步操作
const mysql = require("mysql2/promise");
async function createConnection() {
  const connection = await mysql.createConnection({
    host: "192.3.80.70",
    user: "admin",
    password: "P@ssw0rd",
    database: "db_tripals",
    multipleStatements: true,
  });

  return connection;
}

// connHelper.connect(function (err) {
// 	if (err) {
// 		console.log("資料庫連線錯誤", err.sqlMessage);
// 	} else {
// 		console.log("資料庫連線成功");
// 	}
// });

// 匯出
module.exports = { createConnection };
