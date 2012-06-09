#!/usr/bin/env node
var parser = require('../lib/parseCSV');
var beautify = require('../lib/beautify');

try {
	var googleJSON = parser.parseCSV('data/google/google.csv');

	var mailJSON = google2mail(googleJSON);

//	debugJSON(googleJSON);
	debugJSON(mailJSON);

} catch(e) {
	console.error(e)
}

function debugJSON(json) {
	console.log(beautify.js_beautify(JSON.stringify(json)));
}

function google2mail(googleJSON) {
	var result = {
		"labels": [],
		"contacts": []
	}

	var delimeter = ' ::: ';


	function generateId() {
		generateId.lastId = generateId.lastId + 1 || 1;
		return generateId.lastId;
	}
	
	function parseBirthday(str) {
		if(str) {
			var matches = str.match(/(\d{4})-(\d{2})-(\d{2})/);
			if(matches) {
				return {
					"day": parseInt(matches[3]),
					"month": parseInt(matches[2]),
					"year": parseInt(matches[1])
				}
			}
		}

		return undefined;
	}

	function convertPhoneType(type) {
		return type.match(/^(mobile|home|work|fax|other)$/i) ? type.toLowerCase() : 'other';
	}

	function convertSocialType(type){
		return type.match(/^(other|mra|icq|skype|gtalk|vk|ok|fb|twitter|lj|linkedin|moikrug|www)$/i) ? type.toLowerCase() : 'other';
	}

	function getLabelByName(name) {
		var res = null;

		result.labels.forEach(function(label) {
			if(label.name == name) {
				res = label;
			}
		})

		if(!res) {
			res = {
				"name": name,
				"id": generateId(),
				"contacts": []
			}
			result.labels.push(res);
		}

		return res;
	}

	function getLabelIds(labelStr, contactId) {
		var labels = [];

		labelStr = labelStr || '';
		labelStr.split(delimeter).forEach(function(labelName) {
			labelName = labelName.replace(/\*/g, '').trim();

			var label = getLabelByName(labelName);
			label.contacts.push(contactId)
			labels.push(label.id);
		})

		return labels;
	}

	googleJSON.forEach(function(google) {
		var contact = {};

		contact.id = generateId();
		contact.name = {
			"first": google["Given Name"],
			"last": google["Family Name"]
		}
		contact.nick = google.Nickname;
		contact.birthday = parseBirthday(google.Birthday);
		contact.avatars = {};
		contact.sex = google.Gender; // хз что там, у меня ни у одного контакта не проставлено

		if(google.Organization) {
			contact.company = google.Organization[0].Name;
			contact.job_title = google.Organization[0].Title;
		}

		contact.flags = {
			"star": false
		};

		if(google["E-mail"]) {
			contact.emails = [];

			google["E-mail"].forEach(function(item) {
				item.Value.split(delimeter).forEach(function(email) {
					contact.emails.push(email);
				})
			})
		}

		if(google.Phone) {
			contact.phones = [];

			google.Phone.forEach(function(item) {
				var type = convertPhoneType(item.Type);

				item.Value.split(delimeter).forEach(function(phone) {
					contact.phones.push({
						"type": type,
						"phone": phone
					})
				})
			})
		}

		if(google.IM) {
			contact.social = []

			google.IM.forEach(function(item) {
				var values   = item.Value.split(delimeter);
				item.Service.split(delimeter).forEach(function(service,index) {
					contact.social.push({
						"type": convertSocialType(service),
						"account": values[index]
					})
				})
			})
		}

		if(google.Website) {
			contact.social = contact.social || []

			google.Website.forEach(function(item) {
				item.Value.split(delimeter).forEach(function(url) {
					contact.social.push({
						"type": convertSocialType(item.Type || ''),
						"account": url
					})
				})
			})
		}

		contact.labels = getLabelIds(google['Group Membership'], contact.id)

		contact.comment = google.Notes;

		if(google.Address) {
			contact.country = google.Address[0].Country; // FIXME — здесь должен быть код страны, да и брать его явно надо из другого поля
			contact.address = google.Address[0].Formatted;
		}


		result.contacts.push(contact);
	})

	return result;
}
