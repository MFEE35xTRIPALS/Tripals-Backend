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

// 文章查詢語法
const selectArticle = `            
SELECT
    user.id,
    CASE
	    WHEN user.nickname IS NULL THEN SUBSTRING_INDEX(user.id, '@', 1)
	    WHEN TRIM(user.nickname) = '' THEN SUBSTRING_INDEX(user.id, '@', 1)
	    ELSE user.nickname
	END AS nickname,
    main.articleno AS main_articleno,
    main.title AS main_title,
    main.content AS main_content,
    main.location AS main_location,
    main.image AS main_image,
    content.contentno,
    content.location_index,
    content.title,
    content.content,
    content.location,
    content.image,
    GROUP_CONCAT(hashtag.hashtag ORDER BY hashtag.hashtag ASC SEPARATOR ',') AS hashtags`;
const fromArticle = `
FROM
    tb_main_article AS main
    LEFT JOIN tb_content_article AS content ON main.articleno = content.articleno
    LEFT JOIN tb_user AS user ON main.userno = user.userno
    LEFT JOIN tb_article_hashtag AS article_hashtag ON article_hashtag.articleno = main.articleno
    LEFT JOIN tb_hashtag AS hashtag ON article_hashtag.hashtagno = hashtag.tagno
WHERE
    main.status <> 'report' AND main.articleno = ?
GROUP BY
    user.id ,user.nickname ,main.articleno ,main_title ,main_content ,main_location ,main_image ,content.contentno ,content.location_index ,content.title ,content.content ,content.location ,content.image;
`;

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

		// 執行查詢文章的 SQL 語句
		const [contentResult] = await connection.query(
			selectArticle + fromArticle,
			[articleNo]
		);

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
			formatResult.id = item.id;
			formatResult.nickname = item.nickname;
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
page.get("", express.json(), async (req, res) => {
	const userNo = parseInt(req.query.userno);
	const articleNo = parseInt(req.query.articleno);
	console.log(articleNo);

	// 查詢喜歡過的
	let likedSql = "";
	try {
		const connection = await createConnection();

		// 加入喜歡過的文章
		likedSql =
			",(SELECT EXISTS(SELECT 1 FROM tb_collect WHERE tb_collect.userno = ? AND tb_collect.articleno = ?)) AS liked";

		// 執行查詢文章的 SQL 語句
		const [contentResult] = await connection.query(
			selectArticle + likedSql + fromArticle,
			[userNo, articleNo, articleNo]
		);

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
			formatResult.id = item.id;
			formatResult.nickname = item.nickname;
			formatResult.main_title = item.main_title;
			formatResult.main_content = item.main_content;
			formatResult.main_location = item.main_location;
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
