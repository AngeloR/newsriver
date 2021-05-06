# NewsRiver
This is a constantly updating list of articles from the preconfigured sites. 
You can set whatever sites you want to watch (rss and reddit parsers are 
available) and then the page will reload with new articles from these 
locations.

I love keeping up with new news.. but I don't have the time to really watch 
everything. This allows me a super easy way to keep track of the most recent 
news I want.

# Quick Start
1. Fork the repo
2. Edit the `data/sources.json` file adding whatever sources you would like
3. Copy the `.env.sample` file over to `.env` 
4. Run `npm start` which starts up a local server on port 8000

# Detailed Version

## Requirements
- Node v12.x.x

## Installation
```
git clone https://git.sr.ht/~xangelo/newsriver newsriver
cd newsriver
npm install --production
```

## Starting
1. Set the `PORT` env variable to whatever port you wnat to api to listen to
2. Set the `PERSIST` env variable to teh name of the sqlite3 database

```
PORT=8000 PERSIST=db.sqlite3 npm start
```

This will start the application via the `cluster` module in node. It will 
start up the api, and fork for the ingester. The UI will be available at 
`localhost:8000/`

# Adding new feeds
Edit the `data/sources.json` file adding a new element as outlined below

```
{
    "title": "Name of the feed",
    "parser": [reddit | rss] ,
    "url": "http link to the page to parse"
}
```

# Supported Parsers  
1. Reddit
2. RSS
