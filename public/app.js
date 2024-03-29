'use strict';

function $(thing) {
    let doc = document.querySelectorAll(thing);

    if(doc instanceof NodeList) {
        const convert = Array.from(doc);
        if(convert.length === 1) {
            return convert[0];
        }
        return convert;
    }
    return doc;
}

class App {
    constructor(options) {
        this.interval;

        this.options = options;
        this.pollInterval = 1000 * 60 * 5; // 5 minutes
        this.history = 1000 * 60 * 60 * 4; // last 4 hours

        this.nextKey = this.setFirstKey();

        this.activeFilter;

        this.bodyEvents = {
            click: []
        };
    }

    setFirstKey() {
		return Date.now() - this.history;
    }

    bodyEventFilter(eventType, e) {
        const events = this.bodyEvents[eventType];
        events.forEach(event => {
            const matches = $(event.target);
            if(matches.length > 1) {
                matches.forEach(match => {
                    if(e.target === match) {
                        event.handler(e, match);
                    }
                });
            }
            else {
                if(e.target === match) {
                    event.handler(e, match);
                }
            }
        });
    }

    bindEvents() {
        $('body').addEventListener('click', this.bodyEventFilter.bind(this, 'click'));

        this.bodyEvents.click.push({
            target: '.source',
            handler: this.toggler.bind(this)
        });
    }

    toggler(e) {
        e.preventDefault();
        e.stopPropagation();

        let skip = false;

        $('.item').forEach(el => {
            el.classList.remove('fade');
        });

        if(!e.target.classList.contains('fade') && this.activeFilter) {
            $('.source').forEach(el => el.classList.remove('fade'));
            this.activeFilter = undefined;
            skip = true;
        }

        if(skip)
            return;

        $('.source').filter(el => {
            if(el.attributes['data-unique-id'].value !== e.target.attributes['data-unique-id'].value) {
                el.classList.add('fade');
                return true;
            }
            this.activeFilter = el.attributes['data-unique-id'].value;
            el.classList.remove('fade');
            return false;
        }).forEach(el => {
            const els = $(`.item[data-unique-id=${el.attributes['data-unique-id'].value}]`);
            if(els.forEach) {
                els.forEach(el => el.classList.add('fade'));
            }
            else {
                els.classList.add('fade');
            }
        });
    }

    start() {
        console.info('App Started');
        console.info(`Polling every ${this.pollInterval / 1000 / 60} minutes`);

        this.bindEvents();

        this.interval = setInterval(() => {
            this.poll(this.nextKey);
        }, this.pollInterval);

        this.poll(this.nextKey);

        this.ajax(
            'get', '/sources', (res => {
                const sources = JSON.parse(res.responseText);
                const el = document.querySelector('#sources-list');

                let html = [];
                sources.forEach(source => {
                    html.push(`<a class="source navbar-item" data-unique-id="id-${source.tag_color}" style="border-color:#${source.tag_color}">${source.title}</a>`);
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
        return {
            estimate: moment(date).fromNow(),
            exact: date.toString()
        };
    }

    renderItems(items) {
        let html = '';

        items.forEach(item => {
            const link = document.createElement('a');
            const date = this.formatDate(item.create_date);

            link.href = item.link;
            html += `<div class="block item" style="border-color:#${item.tag_color}" data-unique-id="id-${item.tag_color}">
                <a href="${item.data.link}">${item.data.title}</a>
                <div class="details is-size-7">
                    <a href="${item.data.comments}">${item.source_title} </a>, 
                    <span class="date has-text-grey" title="${date.exact}">${date.estimate}</span>
                </div>
            </div>
            `;
        });

        const $el = document.querySelector('#column-1');
        // ensures that we put new things on top of the page
        $el.innerHTML = html += $el.innerHTML;
    }

    poll(key) {
        console.info(`Polling with key ${key}`);
        // before we poll, lets increment all the existing dates!
        $('.item .date').forEach(el => {
            const date = new Date(el.attributes['title'].value);

            const formatDate = this.formatDate(date.getTime());

            el.attributes['title'].value = formatDate.exact;
            el.innerHTML = formatDate.estimate;
        });
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
