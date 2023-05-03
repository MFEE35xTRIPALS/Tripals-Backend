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
	hashtags,
	status,
	spots
) {
	const connection = await createConnection();

	try {
		// 開始資料庫交易
		await connection.beginTransaction();
		const insertMainSql =
			"INSERT INTO tb_main_article ( userno, title, content, location, image, status) VALUES ( ?, ?, ?, ?, ?, ?)";
		// 新增文章到資料表 tb_main_article
		const [insertArticleResult] = await connection.query(insertMainSql, [
			userno,
			title,
			content,
			location,
			image,
			status,
		]);

		// 取得新增的文章 ID
		const articleNo = insertArticleResult.insertId;

		// hashtag新增處理
		// console.log(hashtags);
		await Promise.all(
			hashtags.map(async (hashtag) => {
				console.log(hashtag);
				// 檢查有無重複的hashtag
				const checkHashtag = "SELECT tagno FROM tb_hashtag WHERE hashtag = ?;";
				const checkRows = await connection.query(checkHashtag, [hashtag]);

				// 由於我們只需要結果數組中的第一個元素（也就是查詢結果），因此使用這種方式可以簡化程式碼。
				// const [checkRows, _] = await connection.query(checkHashtag, [hashtag]);

				let hashtagNo;
				console.log(checkRows);
				if (checkRows[0].length > 0) {
					// 如果 Hashtag 已存在，則使用該 Hashtag 的 ID 新增一條關聯記錄
					hashtagNo = checkRows[0][0].tagno;
				} else {
					console.log("no hashtag");
					// 如果 Hashtag 不存在，則新增一個新的 Hashtag，再使用該 Hashtag 的 ID 新增一條關聯記錄
					const insertHashtag =
						"INSERT INTO tb_hashtag (hashtag, status) VALUES (?, 'T');";
					const [insertResult] = await connection.query(insertHashtag, [
						hashtag,
					]);
					hashtagNo = insertResult.insertId;
					console.log("hashtagNo:" + insertResult.insertId);
				}

				// console.log(hashtagNo);
				// 新增 tb_article_hashtag 關聯紀錄表
				const insertArticleHashtag =
					"INSERT INTO tb_article_hashtag (articleno, hashtagno) VALUES (?, ?);";

				await connection.query(insertArticleHashtag, [articleNo, hashtagNo]);
			})
		);

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
		// 拋出錯誤讓外層的 catch也能捕獲
		// throw new Error("新增文章及內容失敗");
		throw error;
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
	const hashtags = req.body.hashtag;
	const status = req.body.status;
	const spots = req.body.spots;

	try {
		await addArticleAndContents(
			userno,
			title,
			content,
			location,
			image,
			hashtags,
			status,
			spots
		);

		res.status(201).send("新增文章及內容成功");
	} catch (error) {
		console.error(error);
		res.status(500).send("新增文章及內容失敗");
	}
});

// 修改文章
// 先取得文章資料
page.get("/edit/:id", express.json(), async (req, res) => {
	const articleNo = parseInt(req.params.id);
	console.log(articleNo);

	try {
		const connection = await createConnection();

		const sql =
			"SELECT * FROM view_guide WHERE main_articleno = ? ORDER BY location_index";
		// 執行查詢文章的 SQL 語句
		const [contentResult] = await connection.query(sql, [articleNo]);

		// 執行查詢文章的hashtag SQL 語句
		// const [hashtagResult] = await connection.query(hashTagSql, [articleNo]);

		console.log(contentResult);
		// 釋放連線
		await connection.end();

		// 檢查查詢結果是否為空陣列
		if (contentResult.length === 0) {
			return res.status(404).send("沒有找到對應的文章編號");
		}

		const formatResult = {};
		contentResult.forEach((item) => {
			// formatResult.id = item.id;
			// formatResult.nickname = item.nickname;
			formatResult.main_image = item.main_image;
			formatResult.main_title = item.main_title;
			formatResult.main_content = item.main_content;
			formatResult.main_location = item.main_location;
			formatResult.hashtags = item.hashtags ? item.hashtags.split(",") : [];
			formatResult.spots = formatResult.spots || [];

			formatResult.spots.push({
				location_index: item.location_index,
				title: item.title,
				content: item.content,
				location: item.location,
				image: item.image,
			});
		});

		res.json(formatResult);
	} catch (error) {
		console.error(error);
		res.status(500).send("發生錯誤：" + error.message);
	}
});

// 更新文章
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

// 瀏覽文章
page.get("", express.json(), async (req, res) => {
	const userNo = parseInt(req.query.userno);
	const articleNo = parseInt(req.query.articleno);
	console.log(articleNo);

	try {
		const connection = await createConnection();

		// 查詢喜歡過的文章
		const sql =
			"SELECT *,(SELECT EXISTS(SELECT 1 FROM tb_collect WHERE tb_collect.userno = ? AND tb_collect.articleno = ?)) AS liked FROM view_guide WHERE main_articleno = ? ORDER BY location_index;";

		// 執行查詢文章的 SQL 語句
		const [contentResult] = await connection.query(sql, [
			userNo,
			articleNo,
			articleNo,
		]);

		// 執行查詢文章的hashtag SQL 語句
		// const [hashtagResult] = await connection.query(hashTagSql, [articleNo]);

		console.log(contentResult);
		// 關閉連線
		await connection.end();

		// 檢查查詢結果是否為空陣列
		if (contentResult.length === 0) {
			return res.status(404).send("沒有找到對應的文章編號");
		}

		const formatResult = {};
		contentResult.forEach((item) => {
			formatResult.id = item.id;
			formatResult.nickname = item.nickname;
			formatResult.avatar = item.avatar;
			formatResult.main_image = item.main_image;
			formatResult.main_title = item.main_title;
			formatResult.main_content = item.main_content;
			formatResult.main_location = item.main_location;
			formatResult.main_view_count = item.main_view_count;
			formatResult.main_liked_count = item.main_liked_count;
			formatResult.liked = item.liked ? true : false;
			formatResult.hashtags = item.hashtags ? item.hashtags.split(",") : [];
			formatResult.spots = formatResult.spots || [];

			formatResult.spots.push({
				location_index: item.location_index,
				title: item.title,
				content: item.content,
				location: item.location,
				image: item.image,
			});
		});

		res.json(formatResult);
	} catch (error) {
		console.error(error);
		res.status(500).send("發生錯誤：" + error.message);
	}
});

module.exports = page;
