#!/usr/bin/env node
try {
	var googleJSON = require('../lib/parser').fromFile('data/google.csv', null, 'UCS-2');

	var mailJSON = require('../lib/converter').google2mail(googleJSON);

//	debugJSON(googleJSON);
	debugJSON(mailJSON);

} catch(e) {
	console.error(e)
}

function debugJSON(json) {
	console.log(require('../lib/js-beautify/beautify').js_beautify(JSON.stringify(json)));
}
