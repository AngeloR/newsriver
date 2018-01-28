<a href="https://heroku.com/deploy?template=https://github.com/angelor/newsriver/tree/master">
    <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

# Installation
```
git clone https://github.com/AngeloR/newsriver.git newsriver
cd newsriver
npm install --production
```

# Starting
```
npm start
```

This will start the application and leave it running via [pm2](). You 
can stop/manage the application by using `npx pm2` followed by the pm2 
commands found on the linked page.

# Adding new feeds
Edit the `data/sources.json` file adding a new element as outlined below

```
{
    "title": "Name of the feed",
    "parser": One of [reddit] ,
    "url": "http link to the page to parse"
}
```

# Supported Parsers  
1. Reddit
