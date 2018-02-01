<a href="https://heroku.com/deploy?template=https://github.com/angelor/newsriver/tree/master" target="_blank">
    <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

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
3. Click the "Deploy to Heroku" button and enjoy =)

# Detailed Version

## Requirements
- Redis 4+ This has only been tested on versions 4+ but it uses pretty standard 
redis interactions on sets and the expire command.
- Node 8+ This has only been tested on versions 8+ of node

## Installation
```
git clone https://github.com/AngeloR/newsriver.git newsriver
cd newsriver
npm install --production
```

## Starting
1. Set the `REDIS_URL` env variable to whatever your redis installation is
2. Set the `PORT` env variable to whatever port you wnat to api to listen to

```
REDIS_URL=redis://locahost:6379 PORT=8000 npm start
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
