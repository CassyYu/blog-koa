const { Remarkable } = require('remarkable');

function markdownToHtml(article) {
	const md = new Remarkable();
	return md.render(article);
}

module.exports = markdownToHtml;