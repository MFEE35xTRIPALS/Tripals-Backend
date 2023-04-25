var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var connhelper = require("./config");
// -----------------------------------
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

//測試put資料用
const spot = {
	imgpath: "./public/main_guide/1/1_11.jpg",
	title: "台南美食之旅",
	content: "台南美食吃喝玩樂",
	area: "台南市",
	hashtag: ["旅遊", "美食"],
	spots: [
		{
			imgpath: "./public/content_guide/11/11_1.jpg",
			coordinates: "23.011123601783304,120.20032715649646",
			title: "花園夜市",
			content: "花園夜市，為臺灣臺南市北區的流動型夜市",
		},
	],
};
module.exports = page;
