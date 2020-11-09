'use strict';

const request = require('request');
const crypto = require('crypto');
const { EventEmitter } = require('events');

/**
 * Base Ingester class that all ingestion parsers should extend
 */
class Ingester extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
		this.db = options.db;
        this.source = options.source;
    }

	sourceId() {
		return crypto.createHash('md5').update(this.source.url.toString()).digest('hex');
	}

    /**
     * Polls the source URL and hands off the response on a 200 to the "parser"
     * method
     */
    start() {
        request(this.source.url, (e, res, data) => {
            if(e) {
                this.emit('error', e);
                return;
            }

            if(res.statusCode !== 200) {
                this.emit('error', data);
                return;
            }

            this.parser(data);
        });
    }

    /**
     * Takes the items, converts them to buckets, and then saves them
     *
     * @param items array An array of Item objects
     */
    async save(items) {
		const values = [];
		const sql = `insert into data (id, source_id, data, processed_date, create_date) values ${items.map(item => {
			const json = item.json();
			values.push(item.id);
			values.push(this.sourceId());
			values.push(JSON.stringify({
				comments: json.comments,
				link: json.link,
				title: json.title
			}));
			values.push(item.process_date);
			values.push(item.create_date);
			return `(?,?,?,?,?)`;
		}).join(', ')}`

		try {
			await this.db.run(sql, values);
			this.emit('done');
		}
		catch(e) {
			if(e.code !== 'SQLITE_CONSTRAINT')
				this.emit('error', e);
			else
				this.emit('done')
		}
    }
}

module.exports = Ingester;
