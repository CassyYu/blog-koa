const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
	service: 'qq',
	port: 465,
	secure: true,
	auth: {
		user: '980317866@qq.com',
		pass: 'wmlkrdtuceygbbcf'
	}
})

function mailer(mail, code, call) {
	const mailOptions = {
		from: '<980317866@qq.com>',
		to: mail,
		subject: '邮箱验证码',
		text: 'Hello!',
		html: `<p>您的验证码是<strong>${code}</strong></p>`,
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) call(false)
		else call(true)
	});
}

module.exports = mailer;