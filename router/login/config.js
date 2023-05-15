//資料庫連接
/*check :
        1. MAMP open
        2. host
        3. port
        4. database
        5. conn import

*/
const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'db_tripals',
})


conn.connect(function (err) {
    if (err) {
        console.log('ConnectError', err);
    } else {
        console.log('ConnectSuccess');
    }
});

//輸出成module
module.exports = conn;