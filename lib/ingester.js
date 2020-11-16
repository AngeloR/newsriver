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
		const promises = items.map(item => {
			const sql = `insert into data (id, source_id, data, processed_date ,create_date) values (?, ?, ?, ?, ?)`;
			return this.db.query(sql, [
				item.id,
				this.sourceId(),
				JSON.stringify({
					comments: item.comments,
					link: item.link,
					title: item.title
				}),
				item.process_date,
				item.create_date
			]);
		})

		try {
			await Promise.allSettled(promises);
			this.emit('done');
		}
		catch(e) {
			this.emit('error', e);
		}
    }
}

module.exports = Ingester;
