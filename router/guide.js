var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------

// 修改、新增文章
/* POST */
// 要先知道取得文章的id
page.put("/edit/:id", express.json(), function (req, res) {
	const id = parseInt(req.params.id);

	const sql =
		"SELECT articleno FROM tb_main_article WHERE status <> 'report' AND articleno = ?;";

	connhelper.query(sql, [id], function (err, result, fields) {
		if (err) throw err;

		if (result.length === 0) {
			return res.status(404).send("沒有找到對應的文章編號");
		}
		// console.log(res.json(result));

		// const title = req.body.title;
		// const content = req.body.content;
		console.log(req.body);
		res.send("finish");
	});
});

// 取得文章
page.get("/:id", express.json(), function (req, res) {
	const id = parseInt(req.params.id);

	const sql = `SELECT B.title AS main_title ,B.content AS main_content ,A.location_index ,A.title ,A.content ,A.location ,A.image 
FROM tb_content_article AS A
LEFT JOIN tb_main_article AS B ON A.articleno = B.articleno 
WHERE B.status <> 'report' AND B.articleno=?;`;

	connhelper.query(sql, [id], function (err, result, fields) {
		if (err) throw err;

		if (result.length === 0) {
			return res.status(404).send("沒有找到對應的文章編號");
		}
		// console.log(res.json(result));
		const transformedResult = result.map((item) => ({}));

		const newObj = {
			main_title: "台北美食小吃特搜",
			main_content: "必吃的台北小吃一定要嚐過！",
			content: [
				{
					location_index: 1,
					title: "圓環邊蚵仔煎",
					content:
						"寧夏夜市裡排隊人氣名店圓環邊蚵仔煎，更榮獲米其林餐盤推薦，來寧夏夜市千萬別錯過！",
					location: "25.0564052,121.515281",
					image: null,
				},
				{
					location_index: 2,
					title: "士林夜市美食",
					content:
						"士林夜市裡有許多必吃美食，包括了烤香腸、大餅包小餅、豆花、天婦羅等等，快來一嚐！",
					location: "25.0879032,121.5242463",
					image: null,
				},
			],
		};

		res.setHeader("Content-Type", "application/json");
		res.json(result);

		// const title = req.body.title;
		// const content = req.body.content;
		// console.log(req.body);
		// res.send("finish");
	});
});

module.exports = page;
