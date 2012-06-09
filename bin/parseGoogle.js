#!/usr/bin/env node
var parser = require('../lib/parseCSV');
try {
	var data = parser.parseCSV('data/google/google.csv');
	console.log(data);

} catch(e) {
	console.error(e)
}