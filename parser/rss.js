'use strict';

const Ingester = require('../lib/ingester');
const Item = require('../lib/item');
const Parser = require('rss-parser');

class RssIngester extends Ingester {
    constructor(options) {
        super(options);

        this.name = 'Rss Parser';
        this.parser = new Parser();
    }

    start() {
        this.parser.parseURL(this.source.url)
            .then(feed => {
                let items = [];

                feed.items.forEach(raw_item => {
                    const item = Item.Parse({
                        title: raw_item.title,
                        link: raw_item.link,
                        create_date: (new Date(Date.parse(raw_item.pubDate))).getTime(),
                        comments: raw_item.comments
                    });

                    items.push(item);
                });

                this.save(items);
            })
        .catch(e => {
            this.emit('error', e);
        });
    }
}

module.exports = RssIngester;
