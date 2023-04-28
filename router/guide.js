var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var { createConnection } = require("./mysql2_config");
// -----------------------------------

//#region 新增文章、內文
// 新增文章和內文的函式
async function addArticleAndContents(
	userno,
	title,
	content,
	location,
	image,
	hashtag,
	status,
	spots
) {
	const connection = await createConnection();

	try {
		// 開始資料庫交易
		await connection.beginTransaction();
		const insertMainSql =
			"INSERT INTO tb_main_article ( userno, title, content, location, image, hashtag, status) VALUES ( ?, ?, ?, ?, ?, ?, ?)";
		// 新增文章到資料表 tb_main_article
		const [insertArticleResult] = await connection.query(insertMainSql, [
			userno,
			title,
			content,
			location,
			image,
			hashtag,
			status,
		]);

		// 取得新增的文章 ID
		const articleNo = insertArticleResult.insertId;
		// console.log(articleId);
		// 逐一新增內容到資料表 tb_content_article

		await Promise.all(
			spots.map(async (spot) => {
				const insertContentSql =
					"INSERT INTO tb_content_article (articleno, location_index, title, content, location, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
				await connection.query(insertContentSql, [
					articleNo,
					spot.location_index,
					spot.title,
					spot.content,
					spot.location,
					spot.image,
					spot.status,
				]);
			})
		);
		//#region old
		// spots.forEach(async (spot) => {
		// 	await connection.query(
		// 		"INSERT INTO tb_content_article (articleno, location_index, title, content, location, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
		// 		[
		// 			articleNo,
		// 			spot.location_index,
		// 			spot.title,
		// 			spot.content,
		// 			spot.location,
		// 			spot.image,
		// 			spot.status,
		// 		]
		// 	);
		// });
		//#endregion

		// 提交資料庫交易
		await connection.commit();
		// 關閉資料庫連線
		await connection.end();

		console.log("新增文章及內容成功");
	} catch (error) {
		// 發生錯誤時回復資料庫狀態
		await connection.rollback();
		// 關閉資料庫連線
		await connection.end();

		console.error("新增文章及內容失敗");
		// console.error(error);
	}
}
//#endregion

// 新增文章和內容的 API
page.post("/add", express.json(), async (req, res) => {
	const userno = req.body.userno;
	const title = req.body.title;
	const content = req.body.content;
	const location = req.body.location;
	const image = req.body.image;
	const hashtag = req.body.hashtag;
	const status = req.body.status;
	const spots = req.body.spots;

	try {
		await addArticleAndContents(
			userno,
			title,
			content,
			location,
			image,
			hashtag,
			status,
			spots
		);

		res.status(201).send("新增文章及內容成功");
	} catch (error) {
		// console.error(error);
		res.status(500).send("新增文章及內容失敗");
	}
});

// 修改文章
// 先取得文章資料
page.get("/edit/:id", express.json(), async (req, res) => {
	const articleNo = parseInt(req.params.id);
	const connection = await createConnection();

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

		res.json(result);

		// const title = req.body.title;
		// const content = req.body.content;
		// console.log(req.body);
		// res.send("finish");
	});
});
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

// 瀏覽文章
page.get("/view/:id", express.json(), function (req, res) {
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

		res.json(result);

		// const title = req.body.title;
		// const content = req.body.content;
		// console.log(req.body);
		// res.send("finish");
	});
});

module.exports = page;
