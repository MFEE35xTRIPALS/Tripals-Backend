//連server
var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");


//加入收藏
page.post("/like", function (req, res) {
    console.log(req.query);
    userno = parseInt(req.query.userno);
    articleno = parseInt(req.query.articleno);
    // const connection =  createConnection();


    //新增資料到tb-收藏
    const sql = `
    INSERT INTO tb_collect (userno, articleno)
VALUES (?, ?);
    
`;

    connhelper.query(sql, [userno, articleno], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("資料庫發生錯誤,原因：" + err.message);
        }
        //
        res.json(results);
    });
    // res.send("postOKK");

}

);

//取消收藏
page.post("/unlike", function (req, res) {
    console.log(req.query);
    userno = parseInt(req.query.userno);
    articleno = parseInt(req.query.articleno);
    // const connection =  createConnection();


    //delete　tb-收藏的資料
    const sql = `
    DELETE FROM tb_collect WHERE userno = ? AND articleno = ? ;
    
`;

    connhelper.query(sql, [userno, articleno], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("資料庫發生錯誤,原因：" + err.message);
        }
        //
        res.json(results);
    });
    // res.send("postOKK");

}

);

//檢舉文章
page.post("/report", function (req, res) {
    console.log(req.query);
    articleno = parseInt(req.query.articleno);

    //report+1
    const sql = `
    UPDATE tb_main_article SET report_count = report_count + 1 WHERE articleno = ? ;
    
`;

    connhelper.query(sql, [articleno], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("資料庫發生錯誤,原因：" + err.message);
        }
        //
        res.json(results);
    });
    // res.send("postOKK");

}

);


module.exports = page;