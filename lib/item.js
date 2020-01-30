'use strict';

const crypto = require('crypto');

class Item {
    constructor() {
        this.title = '';
        this.link = '';
        this.create_date = Date.now();
        this.process_date = Date.now();
        this.id = undefined;
        this.source_title = '';
    }

    generateId(seeds) {
        const hash = crypto.createHash('sha256');
        seeds.forEach(seed => {
            hash.update(seed.toString());
        });
        return hash.digest('hex');
    }

    json() {
        let data = {};
        data.id = this.id;
        data.title = this.title;
        data.link = this.link;
        data.create_date = this.create_date;
        data.process_date = this.process_date;
        data.comments = this.comments;
        data.source_title = this.source_title;

        return data;
    }

    static Parse(raw) {
        let item = new Item();
        item.title = raw.title;
        item.link = raw.link;
        item.comments = raw.comments;
        item.source_title = raw.source_title;
        if(raw.create_date)
            item.create_date = raw.create_date;
        if(raw.process_date)
            item.process_date = raw.process_date;
        if(raw.id)
            item.id = raw.id;
        else
            item.id = item.generateId([
                item.title, item.link, item.create_date
            ]);

        return item;
    }
}

module.exports = Item;
