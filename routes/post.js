const router = require('koa-router')()
const db = require('../util/db')

router.prefix('/')

router.post('/post', async ctx => {
	const { title, brief, content, tags, cover, state, e_time } = ctx.request.body;
	const postRes = await db.query('select * from tb_post where title = ? and content = ?;', [title, content]);
	const tagstr = tags.join(' ');
	let p_time = 0;
	if (postRes.length > 0) {
		await db.query('update tb_article set e_date=? where title=?;', [e_time, title]);
	} else {
		p_time = e_time;
		await db.query('insert into tb_article (title, brief, content, tags, cover, state, p_time, e_time) values (?,?,?,?,?,?,?,?);', [title, brief, content, tagstr, cover, state, p_time, e_time]);
	}
	const post = { title, brief, content, tags, cover, state, p_time, e_time };
	ctx.body = {
		code: 0,
		message: '文章发送成功',
		data: post
	};
});

router.post('/getPost', async ctx => {
	const { title } = ctx.request.body;
	const postRes = await db.query('select * from tb_post where title = ?;', [title]);
	const post = postRes[0];
	ctx.body = {
		code: 0,
		data: {
			post,
			user: ctx.user
		}
	}
})

module.exports = router