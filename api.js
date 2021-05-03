'use strict';
require('dotenv').config();
const Server = require('./lib/server');
const dateUtils = require('./lib/date');
const sources = require('./data/sources.json');
const db = require('./lib/db');
const fs = require('fs');
const debug = require('debug')('app:api');
const path = require('path');
const crypto = require('crypto');
const {random} = require('./lib/utils');

const server = new Server({
    port: process.env.PORT
});

function loadStaticFile(api, req, res) {
    fs.readFile('./public/'+req.url, (err, data) => {
        if(err) {
            debug(err);
            res.statusCode = 500;
            res.end();
            return;
        }

        res.statusCode = 200;
        res.end(data);
    });
}

server.get('/$', (api, req, res) => {
    req.url = 'index.html';
    loadStaticFile(api, req, res);
});

server.get('^\/(.*)\.(js|html|css|png)', loadStaticFile);

server.get('/api/v1/sources', async (api, req, res) => {
    res.setHeader('Content-Type', 'text/html');
	const sources = await db.query('select * from sources');
    res.end(JSON.stringify(sources));
});

server.get('/api/v1/list/since/(.*)', async (api, req, res) => {
    const since_date = parseInt(api.url.pathname.split('/since/')[1]);
	const sql = 'select data.*, sources.title as source_title, sources.url, sources.tag_color from data join sources on sources.id = data.source_id where data.processed_date >= ? order by data.create_date desc';
	try {
		const items = (await db.query(sql, [since_date])).map(i => {
			const doc = JSON.parse(i.data);
			return {
				data: doc,
				id: i.id,
				processed_date: i.processed_date,
				create_date: i.create_date,
				source_id: i.source_id,
				tag_color: i.tag_color,
				source_title: i.source_title,
				url: i.url
			}
		});

		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({
			nextKey: items.length > 0 ? items[0].processed_date + 1 : since_date,
			items: items
		}));
	}
	catch(e) {
		console.log(e);
	}

});


server.start();
