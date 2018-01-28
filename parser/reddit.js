'use strict';

const Ingester = require('../lib/ingester');
const Item = require('../lib/item');

class RedditIngester extends Ingester {
    constructor(options) {
        super(options);
        this.name = 'Reddit Parser';
    }

    parser(raw) {
        let items = [];
        raw = JSON.parse(raw);
        raw.data.children.forEach(child => {
            const item = Item.Parse({
                title: child.data.title,
                link: `https://www.reddit.com${child.data.permalink}`,
                create_date: child.data.created * 1000
            });

            items.push(item);
        });

        this.save(items);
    }
}

module.exports = RedditIngester;
