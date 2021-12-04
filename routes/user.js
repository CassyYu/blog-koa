const router = require('koa-router')()
const db = require('../util/db')
const tokenUtil = require('../util/token');
const mailer = require('../util/mailer');

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
	const emailRes = await db.query('select * from tb_user where email=? and state=1;', [email])
	const hasEmail = emailRes.length ? true : false;
	const userRes = await db.query("select * from tb_user where email=? and password=? and state=1;", [email, password])
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

function createCode() {
	const set = '0123456789QWERTYUIOPASDFGHJKLZXCVBNM';
	let code = '';
	for (let i = 0; i < 6; i++) {
		const index = Math.floor(Math.random() * (10 + 26))
		code += set[index];
	}
	return code;
}

function sendMail(email, code) {
	new Promise((resolve, reject) => {
		mailer(email, code, (state) => {
			resolve(state);
		})
	}).then(state => {
		if (state) {
			ctx.body = {
				code: 0,
				message: "发送成功"
			}
		} else {
			ctx.body = {
				code: 1,
				message: "失败"
			}
		}
	})
}

router.post('/code', async ctx => {
	const { email } = ctx.request.body;
	const res = await db.query('select * from tb_user where email=?;', [email]);
	const hasUser = res.length ? true : false;
	if (!hasUser) {
		const code = createCode();
		await db.query('insert into tb_user (email, code, state) values (?,?,0)', [email, code])
		sendMail(email, code)
		ctx.body = {
			code: 0,
			message: '验证码已经发送至邮箱，请及时查看'
		}
	} else {
		const res1 = await db.query('select * from tb_user where email=? and state=0', [email]);
		if (res1.length) {
			const code = createCode();
			await db.query('update tb_user set code=? where email=?', [code, email]);
			sendMail(email, code)
			ctx.body = {
				code: 2,
				message: '验证码已经重新发送至邮箱，请及时查看'
			}
		} else {
			ctx.body = {
				code: 1,
				message: '该邮箱已经注册'
			}
		}
	}
})

router.post('/signup', async ctx => {
	const { email, password } = ctx.request.body;
	const code = ctx.request.body.code.toUpperCase();
	const res = await db.query('select * from tb_user where email=? and code=? and state=0', [email, code]);
	if (res.length) {
		await db.query('update tb_user set password=?, state=1 where email=?', [password, email])
		ctx.body = {
			code: 0,
			message: '注册成功'
		}
	} else {
		ctx.body = {
			code: 1,
			message: '注册失败'
		}
	}
})

module.exports = router