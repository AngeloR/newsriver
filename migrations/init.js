const data = require('../data/sources.json');
const crypto = require('crypto');
const {random, urlNormalize} = require('../lib/utils');
const tables = {};

function calculateColor(rawURL) {
    let url = urlNormalize(rawURL);
	let hash = crypto.createHash('md5');
	hash.update(url.id);
	let str = hash.digest('hex');
	return str.substr(random(0, str.length - 7), 6);
}

tables['sources'] = {
	columns: {
		id: {
			type: 'text',
			required: true,
			primary: true
		},
		'title': {
			type: 'text',
			required: true,
		},
		'parser': {
			type: 'text',
			required: true
		},
		'url': {
			type: 'text',
			required: true,
			unique: true
		},
		'tag_color': {
			type: 'text'
		}
	},
	data: data.map(source => {
		return {
			title: source.title,
			url: source.url,
			parser: source.parser,
			tag_color: source.tag_color ?? calculateColor(source.url),
			id: crypto.createHash('md5').update(source.url).digest('hex')
		}
	})
}

tables['sessions'] = {
	columns: {
		session_id: {
			type: 'text',
			primary: true
		},
		last_check: {
			type: 'int'
		}
	}
}

tables['data'] = {
	columns: {
		source_id: {
			type: 'text'
		},
		id: {
			type: 'text',
			primary: true
		},
		data: {
			type: 'blob'
		},
		processed_date: {
			type: 'int'
		},
		create_date: {
			type: 'int'
		}
	}
}

module.exports = tables;
