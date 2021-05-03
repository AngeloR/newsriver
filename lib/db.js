const IN_DEBUG = process.env.DEBUG ?? false

const sqlite = IN_DEBUG ? require('sqlite3').verbose() : require('sqlite3');
const debug = require('debug')('app:db:profile');
const db = new sqlite.Database(process.env.PERSIST ?? ':memory:');

if (IN_DEBUG) {
	db.on('profile', (query, time) => {
		debug(query, time);
	});
}


function run(query, params) {
	return new Promise((resolve, reject) => {
		db.run(query, params, (err, result) => {
			if(err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		});
	});
}

function all(query, params) {
	return new Promise((resolve, reject) => {
		db.all(query, params, (err, result) => {
			if(err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		});
	});
}

function query(query, params) {
	if(query.indexOf('select') === 0 || query.indexOf('SELECT') === 0) {
		return all(query, params);
	}
	else {
		return run(query, params);
	}
}


module.exports = {
	run: run,
	all: all,
	query: query
};
