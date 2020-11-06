require('dotenv').config();
const db = require('../lib/db');
const tables = require('../migrations/init.js');
const debug = require('debug')('app:db:migrations');

Object.keys(tables).forEach(async name => {
	const table = tables[name];
	const columns = Object.keys(table.columns);

	const sql = `create table ${name} (${columns.map(c => {
		const col = table.columns[c];
		const def = `${c} ${col.type}`;
		const constraints = [];

		if(col.unique) {
			constraints.push('UNIQUE');
		}
		if(col.primary) {
			if(typeof col.primary === typeof true) 
				constraints.push('PRIMARY KEY')
			else
				constraints.push(`PRIMARY KEY ${col.primary}`);
		}

		if(constraints.length)
			return def + ' ' + constraints.join(' ');
		else
			return def;
	}).join(", ")});`;

	debug(`creating table ${name}: ${sql}`);

	await db.query(sql);

	if(table.data) {
		const rows = table.data.map(row => {
			return `(${columns.map(col => {
				if(['text','blob'].indexOf(table.columns[col].type) >= 0) {
					return `'${row[col]}'`;
				}
				return row[col];
			}).join(',')})`;
		});

		await db.query(`insert into ${name} (${columns.join(',')}) values ${rows.join(',')}`);
		const res = await db.query(`select count(*) as total from ${name}`);
		debug(`${res[0].total} rows inserted`);
	}

});
