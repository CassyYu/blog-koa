const { Remarkable } = require('remarkable');

function markdownToHtml(article) {
	const md = new Remarkable();
	console.log(md.render(article))
	return md.render(article);
}

module.exports = markdownToHtml;