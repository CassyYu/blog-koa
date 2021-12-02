const jwt = require('jsonwebtoken');

const privateKey = 'xsj';
const maxAge = 60;

const tokenUtil = {
	sign: function (userName) {
		const payload = { userName };
		const token = jwt.sign(payload, privateKey);
		return token;
	},
	verify: function (token) {
		const decode = jwt.verify(token, privateKey, { maxAge });
		return decode;
	}
}

module.exports = tokenUtil;