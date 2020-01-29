'use strict';

class App {
    constructor(options) {
        this.interval;

        this.options = options;
        this.pollInterval = 1000 * 60 * 5; // 5 minutes
        this.history = 60 * 12; // last 4 hours

        this.nextKey = this.setFirstKey();

    }

    setFirstKey() {
        let d = new Date();
        // just round to the nearest hour?
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMinutes(d.getUTCMinutes() - this.history);

        return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}@${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
    }

    start() {
        console.info('App Started');
        console.info(`Polling every ${this.pollInterval / 1000 / 60} minutes`);

        this.interval = setInterval(() => {
            this.poll(this.nextKey);
        }, this.pollInterval);

        this.poll(this.nextKey);

        this.ajax(
            'get', '/sources', (res => {
                const sources = JSON.parse(res.responseText);
                const el = document.querySelector('#tagline');

                let html = [];
                sources.forEach(source => {
                    html.push(`<span class="site" style="border-color:#${source.tag_color}">${source.title}</span>`);
                });

                el.innerHTML = html.join(' ');
            })
        );
    }

    stop() {
        clearInterval(this.interval);
    }

    formatDate(dateString) {
        let date = new Date(parseInt(dateString));

        return date.toString();
    }

    renderItems(items) {
        let html = '';

        items.forEach(item => {
            const link = document.createElement('a');
			const host = document.createElement('a');

			host.href = item.comments;
            link.href = item.link;
            html += `<div class="item" style="border-color:#${item.tag_color}">
                <a href="${item.link}">${item.title}</a>
                <div class="details">
                    Posted on <a href="${item.comments}">${host.hostname}</a>, 
                    <span class="date">${this.formatDate(item.create_date)}</span>
                </div>
            </div>
            `;
        });

        const $el = document.querySelector('#river');
        // ensures that we put new things on top of the page
        $el.innerHTML = html += $el.innerHTML;
    }

    poll(key) {
        console.info(`Polling with key ${key}`);
        this.ajax(
            'get', '/list/since/'+key,
            (r) => {
                const data = JSON.parse(r.responseText);
                this.nextKey = data.nextKey;
                this.renderItems(data.items);
            }
        );
    }

    ajax(method, api_endpoint, handler) {
        const url = this.options.api + api_endpoint;
        const r = new XMLHttpRequest();

        r.onreadystatechange = function() {
            if (r.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                handler(r);
            }
        };

        r.open(method.toUpperCase(), url, true);
        r.send();
    }
}
