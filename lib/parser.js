// TODO - fix issue with UTF-16LE
(function(parser) {
	// This will parse a delimited string into an array of
	// arrays. The default delimiter is the comma, but this
	// can be overriden in the second argument.
	function CSVToArray( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");

		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
				(
						// Delimiters.
						"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

						// Quoted fields.
						"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

						// Standard fields.
						"([^\"\\" + strDelimiter + "\\r\\n]*))"
				),
				"gi"
				);


		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];

		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;


		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){

				// Get the delimiter that was found.
				var strMatchedDelimiter = arrMatches[ 1 ];

				// Check to see if the given delimiter has a length
				// (is not the start of string) and if it matches
				// field delimiter. If id does not, then we know
				// that this delimiter is a row delimiter.
				if (
						strMatchedDelimiter.length &&
						(strMatchedDelimiter != strDelimiter)
						){

						// Since we have reached a new row of data,
						// add an empty row to our data array.
						arrData.push( [] );

				}


				// Now that we have our delimiter out of the way,
				// let's check to see which kind of value we
				// captured (quoted or unquoted).
				if (arrMatches[ 2 ]){

						// We found a quoted value. When we capture
						// this value, unescape any double quotes.
						var strMatchedValue = arrMatches[ 2 ].replace(
								new RegExp( "\"\"", "g" ),
								"\""
								);

				} else {

						// We found a non-quoted value.
						var strMatchedValue = arrMatches[ 3 ];

				}


				// Now that we have our value string, let's add
				// it to the data array.
				arrData[ arrData.length - 1 ].push( strMatchedValue );
		}

		// Return the parsed data.
		return( arrData );
	}

	parser.fromFile = function(filePath, strDelimiter, encoding) {
		encoding = encoding || 'UTF-8';

		var fs = require('fs');

		return this.fromString(fs.readFileSync(filePath, encoding), strDelimiter);
	}

	parser.fromString = function(source, strDelimiter) {
		var data = CSVToArray(source, strDelimiter);

		var fields = data.shift(data);

		var result = [];

		data.forEach(function(csvRow) {
			var row = {};

			fields.forEach(function(field, k) {
				var matches = field.match(/^(.+) (\d+) - (.+)$/);

				if(!csvRow[k]) {
					return;
				}

				if(matches) {
					var field = matches[1],
					    cnt   = matches[2] - 1,
					    type  = matches[3];

					row[field]            = row[field]      || []
					row[field][cnt]       = row[field][cnt] || {}
					row[field][cnt][type] = csvRow[k];

				} else {
					row[field] = csvRow[k];
				}
			})

			result.push(row);
		})

		return result;
	}

})(typeof exports !== "undefined" ? exports : {});
