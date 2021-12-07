const router = require('koa-router')()
const db = require('../util/db')

router.prefix('/')

router.post('/getArticles', async ctx => {
	const articles = await db.query('select * from tb_article;');
	ctx.body = {
		code: 0,
		data: {
			articles
		}
	}
})

router.post('/getSortedArticles', async ctx => {
	const { sortBy, limit, offset } = ctx.request.body;
	const articles = await db.query('select * from tb_article;');
	ctx.body = {
		code: 0,
		data: {
			articles
		}
	}
})

router.post('/getArticlesByState', async ctx => {
	const { state, limit, offset } = ctx.request.body;
	if (state === 0) {
		const articles = await db.query('select * from tb_article;');
		ctx.body = {
			code: 0,
			data: {
				articles
			}
		}
	} else {
		const articles = await db.query('select * from tb_article where state=?;', [state]);
		ctx.body = {
			code: 0,
			data: {
				articles
			}
		}
	}
})

router.post('/getArticlesByValue', async ctx => {
	const { value, limit, offset } = ctx.request.body;
	// 模糊搜索
	const articles = await db.query('select * from tb_article;');
	ctx.body = {
		code: 0,
		data: {
			articles
		}
	}
})

router.post('/getArticlesByTag', async ctx => {
	const { tag, limit, offset } = ctx.request.body;
	// 模糊搜索
	if (tag === '') {
		const articles = await db.query('select * from tb_article');
		ctx.body = {
			code: 0,
			data: {
				articles
			}
		}
	} else {
		const articles = await db.query('select * from tb_article;');
		ctx.body = {
			code: 0,
			data: {
				articles
			}
		}
	}
})

router.post('/getArticleById', async ctx => {
	const { id } = ctx.request.body;
	// 模糊搜索
	const res = await db.query('select * from tb_article where id=?;', [id]);
	if (res.length === 1) {
		ctx.body = {
			code: 0,
			data: {
				article: res[0]
			}
		}
	} else {
		ctx.body = {
			code: 1,
			messsage: '未找到此文章'
		}
	}
})

router.post('/getTags', async ctx => {
	const { value, limit, offset } = ctx.request.body;
	// 模糊搜索
	const articles = await db.query('select * from tb_article where tag = ;');
	ctx.body = {
		code: 0,
		data: {
			articles
		}
	}
})

router.post('/getCommentsByPostId', async ctx => {
	const { post_id } = ctx.request.body;
	let comments = await db.query('select * from tb_comment where post_id = ? and level = 1', [post_id]);
	let replies = await db.query('select * from tb_comment where post_id = ? and level is null', [post_id]);
	comments.sort((a, b) => a.p_time - b.p_time);
	replies.sort((a, b) => a.p_time - b.p_time);
	comments.forEach(comment => comment.replies = []);
	replies.forEach(reply => {
		for (let i = 0; i < comments.length; i++) {
			if (comments[i].id === reply.reply_id) {
				comments[i].replies.push(reply);
				return;
			}
		}
	})
	ctx.body = {
		code: 0,
		data: {
			comments
		}
	}
})

router.post('/getCommentsByReplyId', async ctx => {
	const { post_id, reply_id } = ctx.request.body;
	// 模糊搜索
	const comments = await db.query('select * from tb_comment where post_id = ? and reply_id = ?;', [post_id, reply_id]);
	ctx.body = {
		code: 0,
		data: {
			comments
		}
	}
})

router.post('/postComment', async ctx => {
	const { post_id, reply_id, p_time, content, level } = ctx.request.body;
	const { login, info } = ctx.user;
	if (!login) {
		ctx.body = {
			code: 1,
			message: '未登录'
		}
	} else {
		const email = info.userName;
		await db.query('insert into tb_comment (post_id, email, content, p_time, level, reply_id) values (?,?,?,?,?,?)', [post_id, email, content, p_time, level, reply_id]);
		if (reply_id) {
			const res = await db.query('select * from tb_comment where id=?', [reply_id]);
			const reply = res[0].reply + 1;
			await db.query('update tb_comment set reply=? where id=?', [reply, reply_id])
		}
		const res = await db.query('select * from tb_article where id=?', [post_id]);
		const comment = res[0].comment + 1;
		await db.query('update tb_article set comment=? where id=?', [comment, post_id])
		ctx.body = {
			code: 0
		}
	}
})

module.exports = router