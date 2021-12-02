const router = require('koa-router')()
const db = require('../util/db')

router.prefix('/')

router.get('/dataSource', async ctx => {
	const res = await db.query('select * from tb_post;');
	if (res) {
		ctx.body = {
			code: 0,
			data: res
		}
	} else {
		ctx.body = {
			code: 1,
			message: '没有文章'
		}
	}
});

module.exports = router