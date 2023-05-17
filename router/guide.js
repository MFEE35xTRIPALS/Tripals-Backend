var path = require("path");
var fs = require("fs");
var express = require("express");
var page = express.Router();
// -----------------------------------
// 連線資料庫 port 3306
// -----------------------------------
var { createConnection } = require("./mysql2_config");
// -----------------------------------
var multer = require("multer");
const { send } = require("process");
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
				// console.log(hashtag);

				let hashtagNo = await addHashtagAndNo(connection, hashtag);

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

async function addHashtagAndNo(connection, hashtag) {
	// console.log(hashtag);
	// 檢查有無重複的hashtag
	const checkHashtag = "SELECT tagno FROM tb_hashtag WHERE hashtag = ?;";
	const checkRows = await connection.query(checkHashtag, [hashtag]);

	// 由於我們只需要結果數組中的第一個元素（也就是查詢結果），因此使用這種方式可以簡化程式碼。
	// const [checkRows, _] = await connection.query(checkHashtag, [hashtag]);

	let hashtagNo;
	// console.log(checkRows);
	if (checkRows[0].length > 0) {
		// 如果 Hashtag 已存在，則使用該 Hashtag 的 ID 新增一條關聯記錄
		hashtagNo = checkRows[0][0].tagno;
	} else {
		console.log("no hashtag");
		// 如果 Hashtag 不存在，則新增一個新的 Hashtag，再使用該 Hashtag 的 ID 新增一條關聯記錄
		const insertHashtag =
			"INSERT INTO tb_hashtag (hashtag, status) VALUES (?, 'T');";
		const [insertResult] = await connection.query(insertHashtag, [hashtag]);
		hashtagNo = insertResult.insertId;
		// console.log("hashtagNo:" + insertResult.insertId);
	}

	return hashtagNo;
}

// 新增文章和內容的 API
page.post("/add", express.json(), async (req, res) => {
	const userno = req.body.userno;
	const title = req.body.main_title;
	const content = req.body.main_content;
	const location = req.body.main_location;
	const image = req.body.main_image;
	const hashtags = req.body.hashtags;
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

		// console.log(contentResult);
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
			formatResult.main_articleno = item.main_articleno;
			formatResult.main_title = item.main_title;
			formatResult.main_content = item.main_content;
			formatResult.main_location = item.main_location;
			formatResult.main_image = item.main_image;
			formatResult.hashtags = item.hashtags ? item.hashtags.split(",") : [];
			formatResult.spots = formatResult.spots || [];

			formatResult.spots.push({
				contentno: item.contentno,
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
page.patch("/edit/:id", express.json(), async (req, res) => {
	const articleNo = req.body.main_articleno;
	const title = req.body.main_title;
	const content = req.body.main_content;
	const location = req.body.main_location;
	const image = req.body.main_image;
	const hashtags = req.body.hashtags;
	const status = req.body.status;
	const spots = req.body.spots;

	const connection = await createConnection();

	try {
		// 開始資料庫交易
		await connection.beginTransaction();
		// console.log(title);

		// 定義一個空的查詢
		let setClause = "";

		// 定義一個空的陣列存放參數
		let params = [];

		// 判斷要放入的set子句
		if (title) {
			console.log("我有更改title");
			setClause += "tb_main_article.title = ?, ";
			params.push(title);
		}
		if (content) {
			console.log("我有更改content");
			setClause += "tb_main_article.content = ?, ";
			params.push(content);
		}
		if (location) {
			console.log("我有更改location");
			setClause += "tb_main_article.location = ?, ";
			params.push(location);
		}
		if (image) {
			console.log("我有更改image");
			setClause += "tb_main_article.image = ?, ";
			params.push(image);
		}

		if (status) {
			console.log("我有更改status");
			setClause += "tb_main_article.status = ?, ";
			params.push(status);
		}

		// params長度 >0 再修改
		if (params.length > 0) {
			setClause = setClause.slice(0, -2);
			params.push(articleNo);

			connection.query(
				`UPDATE tb_main_article SET ${setClause} WHERE tb_main_article.articleno = ?`,
				params
			);
		}

		if (hashtags) {
			console.log("我有更改hashtag");
			// 先刪掉文章關聯的 hashtag 再重新加入
			await connection.query(
				"DELETE FROM tb_article_hashtag WHERE articleno = ?",
				[articleNo]
			);
			await Promise.all(
				hashtags.map(async (hashtag) => {
					// console.log(hashtag);

					let hashtagNo = await addHashtagAndNo(connection, hashtag);

					// 新增 tb_article_hashtag 關聯紀錄表
					const insertArticleHashtag =
						"INSERT INTO tb_article_hashtag (articleno, hashtagno) VALUES (?, ?);";

					connection.query(insertArticleHashtag, [articleNo, hashtagNo]);
				})
			);
		}

		if (spots) {
			console.log("我有更改spots");
			spots.map((spot) => {
				let setClause = "";
				let params = [];

				if (spot.location_index) {
					setClause += "tb_content_article.location_index = ?, ";
					params.push(spot.location_index);
				}
				if (spot.title) {
					setClause += "tb_content_article.title = ?, ";
					params.push(spot.title);
				}
				if (spot.content) {
					setClause += "tb_content_article.content = ?, ";
					params.push(spot.content);
				}
				if (spot.location) {
					setClause += "tb_content_article.location = ?, ";
					params.push(spot.location);
				}
				if (spot.image) {
					setClause += "tb_content_article.image = ?, ";
					params.push(spot.image);
				}

				// params長度 >0 再修改
				if (params.length > 0) {
					setClause = setClause.slice(0, -2);
					params.push(spot.contentno);

					connection.query(
						`UPDATE tb_content_article SET ${setClause} WHERE tb_content_article.contentno = ?`,
						params
					);
				}
			});
		}

		// 提交資料庫交易
		await connection.commit();
		// 關閉資料庫連線
		await connection.end();

		res.status(201).send("更新成功");
	} catch (error) {
		console.error(error);
		// 發生錯誤時回復資料庫狀態
		await connection.rollback();
		// 釋放連線
		await connection.end();
		res.status(500).send("發生錯誤：" + error.message);
	}
});

// 瀏覽文章
page.get("", express.json(), async (req, res) => {
	const userNo = parseInt(req.query.userno);
	const articleNo = parseInt(req.query.articleno);
	// console.log(articleNo);

	try {
		const connection = await createConnection();

		// 查詢喜歡過的文章
		const sql =
			"SELECT *,(SELECT EXISTS(SELECT 1 FROM tb_collect WHERE tb_collect.userno = ? AND tb_collect.articleno = ?)) AS liked FROM view_guide WHERE main_articleno = ? ORDER BY location_index;";
		const sql2 =
		"SELECT add_date FROM `tb_main_article` WHERE articleno=?;";
		const sql3 =
		"UPDATE `tb_main_article` SET `view_count`=`view_count`+1 WHERE `articleno`=?;";

		// 執行查詢文章的 SQL 語句
		const [contentResult] = await connection.query(sql+sql2+sql3, [
			userNo,
			articleNo,
			articleNo,
			articleNo,
			articleNo,
		]);

		// 執行查詢文章的hashtag SQL 語句
		// const [hashtagResult] = await connection.query(hashTagSql, [articleNo]);

		// console.log(contentResult);
		// 關閉連線
		await connection.end();
// console.log(contentResult[1][0].add_date);
		// 檢查查詢結果是否為空陣列
		if (contentResult[0].length === 0) {
			return res.status(404).send("沒有找到對應的文章編號");
		}

		const formatResult = {};
		// console.log(contentResult[0]);
		formatResult.add_date = contentResult[1][0].add_date;
		contentResult[0].forEach((item) => {
			formatResult.userno = userNo;
			formatResult.articleno = articleNo;
			formatResult.id = item.id;
			formatResult.nickname = item.nickname;
			formatResult.avatar = item.avatar;
			formatResult.main_title = item.main_title;
			formatResult.main_content = item.main_content;
			formatResult.main_location = item.main_location;
			formatResult.main_image = item.main_image;
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

//#region 圖片上傳
const mainStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// console.log("Upload test");
		const mainFolderPath = path.join(
			"public",
			"temp",
			"main"
			// req.body.mainId.toString()
		);
		if (!fs.existsSync(mainFolderPath)) {
			fs.mkdirSync(mainFolderPath, { recursive: true });
		}
		cb(null, mainFolderPath);
	},
	filename: function (req, file, cb) {
		cb(
			null,
			"main_" +
				req.query.main_articleno.toString() +
				path.extname(file.originalname)
		);
	},
});

const contentStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		const contentFolderPath = path.join(
			"public",
			"temp",
			"content",
			req.body.main_articleno.toString()
		);
		if (!fs.existsSync(contentFolderPath)) {
			fs.mkdirSync(contentFolderPath, { recursive: true });
		}
		cb(null, contentFolderPath);
	},
	filename: function (req, file, cb) {
		cb(null, contentno + path.extname(file.originalname));
	},
});

// 定義檔案過濾，只允許圖片類型
const fileFilter = function (req, file, cb) {
	const filetypes = /jpeg|jpg|png/;
	const mimetype = filetypes.test(file.mimetype);
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	if (mimetype && extname) {
		return cb(null, true);
	}
	cb(new Error("只允許上傳圖片類型的檔案"));
};

const mainUpload = multer({ storage: mainStorage, fileFilter: fileFilter });
const contentUpload = multer({
	storage: contentStorage,
	fileFilter: fileFilter,
});

//#endregion

page.post("/upload/main", mainUpload.single("mainImage"), (req, res) => {
	console.log("上傳");
	// res.json("上傳");
	// 主要文章上傳處理邏輯;
	if (req.file) {
		// 如果成功上傳檔案，回傳檔案路徑
		// res.json({ path: req.file.path });
		res.send("成功");
	} else {
		// 如果上傳失敗，回傳錯誤訊息
		res.status(400).json({ error: "上傳失敗" });
	}
});

page.post("/upload/content", contentUpload.single("content"), (req, res) => {
	// 內容上傳處理邏輯
	if (req.file) {
		// 如果成功上傳檔案，回傳檔案路徑
		res.json({ path: req.file.path });
	} else {
		// 如果上傳失敗，回傳錯誤訊息
		res.status(400).json({ error: "上傳失敗" });
	}
});

// page.post("/upload_file", myUpload.single("myfile"), function (req, res) {
// 	console.log(req.file);
// 	console.log("原始檔名:" + req.file.originalname);
// 	console.log("檔案類型:" + req.file.mimetype);
// 	console.log("檔案大小:" + req.file.size);
// 	console.log("檔案路徑:" + req.file.path);
// 	res.send("上傳成功");
// });

// 資料比較測試用
page.get("/test", express.json(), async (req, res) => {
	let originalData = {
		main_articleno: 2,
		main_title: "基隆一日遊 測試",
		main_content: "沿著海岸線享受漁港美食及風景 測試",
		main_location: "基隆市",
		main_image: "./guide/main/2/main.jpg",
		hashtags: ["在地美食", "文化探索", "深度旅遊", "老街", "基隆"],
		spots: [
			{
				contentno: 6,
				location_index: 1,
				title: "望幽谷測試",
				content:
					"望幽谷是一個V字型的山谷，可在綠油油的草地放鬆也可看到八斗子漁港來往的漁船，以及可眺望到遠處的基隆嶼，遊客至此，在環狀的稜線及山谷步道，漫步於山谷草地，走於臨崖的稜線，遠眺海天，俯瞰崖下的海蝕平台豆腐岩，還有雄奇可觀的臨海峭壁，夜晚時分海面上漁火點點與九份山城的燈火，形成一齣唯美的山海之戀。",
				location: "25.1457121,121.7954435",
				image: null,
			},
			{
				contentno: 7,
				location_index: 2,
				title: "基隆市廟口小吃",
				content:
					"廟口小吃是基隆夜市的代表，廟口是指鄰近基隆港的重要商業區域，而當地小吃以傳統的台灣味為主，像是大腸包小腸、生煎包、鹽酥雞等，味道鮮美，值得品嚐。",
				location: "25.132734,121.74698",
				image: null,
			},
			{
				contentno: 8,
				location_index: 3,
				title: "和平島海邊測試",
				content:
					"和平島是基隆市著名景點，以美麗的海岸風光及多樣的海洋生物而聞名，這裡有美麗的沙灘、海水浴場、民俗文化村、水族館等，更是看日出和賞海豚的最佳地點。",
				location: "25.141735,121.757748",
				image: null,
			},
			{
				contentno: 9,
				location_index: 4,
				title: "基隆餅",
				content:
					"基隆餅是基隆最具代表性的美食之一，外皮烤得金黃酥脆，內餡包裹著鹹甜可口的肉鬆，是台灣經典的小吃之一。遊客至基隆不妨到基隆廟口或中正路一帶，嚐嚐道地的基隆餅。",
				location: "25.130918, 121.740714",
				image: null,
			},
			{
				contentno: 10,
				location_index: 5,
				title: "和平島",
				content:
					"和平島是基隆市的著名景點之一，被譽為海上花園，有著美麗的海岸線和豐富的海洋生態。遊客至此可欣賞到美麗的海景、參觀海洋生物博物館、探索融合了文化與藝術的島上藝術村等。",
				location: "25.147834, 121.765357",
				image: null,
			},
			{
				contentno: 11,
				location_index: 6,
				title: "基隆港測試",
				content:
					"基隆港是台灣歷史最悠久、規模最大的港口之一，也是台灣最主要的貨櫃運輸樞紐。遊客至此可參觀貨櫃碼頭、遠洋漁船碼頭等，還可以搭乘港口觀光遊艇欣賞基隆港風光。",
				location: "25.137775, 121.749821",
				image: null,
			},
		],
	};

	let updatedData = {
		main_articleno: 2,
		main_title: "基隆一日",
		main_content: "沿著海岸線享受漁港美食及風景",
		main_location: "基隆市",
		main_image: "./guide/main/2/main.jpg",
		hashtags: ["在地美食", "老街", "基隆"],
		spots: [
			{
				contentno: 6,
				location_index: 1,
				title: "望幽谷測試",
				content:
					"望幽谷是一個V字型的山谷，可在綠油油的草地放鬆也可看到八斗子漁港來往的漁船，以及可眺望到遠處的基隆嶼，遊客至此，在環狀的稜線及山谷步道，漫步於山谷草地，走於臨崖的稜線，遠眺海天，俯瞰崖下的海蝕平台豆腐岩，還有雄奇可觀的臨海峭壁，夜晚時分海面上漁火點點與九份山城的燈火，形成一齣唯美的山海之戀。",
				location: "25.1457121,121.7954435",
				image: null,
			},
			{
				contentno: 7,
				location_index: 2,
				title: "基隆市廟口小吃",
				content:
					"廟口小吃是基隆夜市的代表，廟口是指鄰近基隆港的重要商業區域，而當地小吃以傳統的台灣味為主，像是大腸包小腸、生煎包、鹽酥雞等，味道鮮美，值得品嚐。",
				location: "25.132734,121.74698",
				image: null,
			},
			{
				contentno: 8,
				location_index: 3,
				title: "和平島海邊測試",
				content:
					"和平島是基隆市著名景點，以美麗的海岸風光及多樣的海洋生物而聞名，這裡有美麗的沙灘、海水浴場、民俗文化村、水族館等，更是看日出和賞海豚的最佳地點。",
				location: "25.141735,121.757748",
				image: null,
			},
			{
				contentno: 9,
				location_index: 4,
				title: "基隆餅",
				content:
					"基隆餅是基隆最具代表性的美食之一，外皮烤得金黃酥脆，內餡包裹著鹹甜可口的肉鬆，是台灣經典的小吃之一。遊客至基隆不妨到基隆廟口或中正路一帶，嚐嚐道地的基隆餅。",
				location: "25.130918, 121.740714",
				image: null,
			},
			{
				contentno: 10,
				location_index: 5,
				title: "和平島測試比較",
				content:
					"和平島是基隆市的著名景點之一，被譽為海上花園，有著美麗的海岸線和豐富的海洋生態。遊客至此可欣賞到美麗的海景、參觀海洋生物博物館、探索融合了文化與藝術的島上藝術村等。",
				location: "25.147834, 121.765357",
				image: null,
			},
			{
				contentno: 11,
				location_index: 6,
				title: "基隆港",
				content:
					"基隆港是台灣歷史最悠久、規模最大的港口之一，也是台灣最主要的貨櫃運輸樞紐。遊客至此可參觀貨櫃碼頭、遠洋漁船碼頭等，還可以搭乘港口觀光遊艇欣賞基隆港風光。",
				location: "25.137775, 121.749821",
				image: "/test.jpg",
			},
		],
	};

	// 比較原始資料和修改後的資料，提取異動資料
	const diffData = {};

	// 加入 main_articleno 和 contentno 作為固定的 key
	diffData.main_articleno = originalData.main_articleno;
	// 比較主要屬性是否有異動
	for (const key in originalData) {
		if (Array.isArray(originalData[key])) {
			// 如果是陣列，則進行陣列元素的比較
			if (
				JSON.stringify(originalData[key]) !== JSON.stringify(updatedData[key])
			) {
				diffData[key] = updatedData[key];
			}
		} else if (originalData[key] !== updatedData[key]) {
			// 如果是物件，則進行物件值的比較
			diffData[key] = updatedData[key];
		}
	}

	// 比較 spots 陣列中的每個物件是否有異動
	diffData.spots = [];

	for (let i = 0; i < originalData.spots.length; i++) {
		const originalSpot = originalData.spots[i];
		const updatedSpot = updatedData.spots[i];

		const diffSpot = {};

		for (const key in originalSpot) {
			if (originalSpot.hasOwnProperty(key)) {
				if (originalSpot[key] !== updatedSpot[key]) {
					diffSpot[key] = updatedSpot[key];
				}
			}
		}

		if (Object.keys(diffSpot).length > 0) {
			diffData.spots.push({
				contentno: originalSpot.contentno,
				...diffSpot,
				// location_index: originalSpot.location_index,
			});
		}
	}

	res.json(diffData);
});

page.get("/path", express.json(), async (req, res) => {
	const uploadPath = path.join("../public", "1");
	res.send(uploadPath);
});

module.exports = page;
