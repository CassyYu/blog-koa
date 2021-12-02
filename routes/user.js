const router = require('koa-router')()
const db = require('../util/db')
const tokenUtil = require('../util/token');

router.prefix('/user')

router.get('/verify', async ctx => {
	const { login, info } = ctx.user;
	if (login) {
		ctx.body = {
			code: 0,
			data: { login, user: info }
		}
	} else {
		ctx.body = {
			code: 1,
			message: '未登录'
		}
	}
})

router.post('/login', async ctx => {
	const { email, password } = ctx.request.body;
	const emailRes = await db.query('select * from tb_user where email=?;', [email])
	const hasEmail = emailRes.length ? true : false;
	const userRes = await db.query("select * from tb_user where email=? and password=? and state='1';", [email, password])
	const hasUser = userRes.length ? true : false;
	if (hasEmail && hasUser) {
		const token = tokenUtil.sign(email);
		ctx.body = {
			code: 0,
			message: '登录成功',
			data: { token }
		};
	} else if (hasEmail) {
		ctx.body = {
			code: 1,
			message: '密码错误'
		};
	} else {
		ctx.body = {
			code: 2,
			message: '该账号未注册'
		};
	}
});

router.post('/code', async ctx => {
	const set = '0123456789QWERTYUIOPASDFGHJKLZXCVBNM';
	let code = '';
	for (let i = 0; i < 6; i++) {
		const index = Math.floor(Math.random() * (10 + 26))
		code += set[index];
	}
	const { email } = ctx.request.body;
	const res = await db.query('select * from tb_user where email=? and state=1;', [email]);
	const hasUser = res.length ? true : false;
	if (!hasUser) {
		await db.query('insert into tb_user where email=? and code=? and state=0', [email, code])
	}
	ctx.body = {
		hasUser: hasUser
	}
})

module.exports = router