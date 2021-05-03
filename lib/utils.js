function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function urlNormalize(rawURL) {
    let url = new URL(rawURL);
    switch(url.host) {
        case 'www.reddit.com':
            let pieces = url.pathname.split('/');
            // piece 0 is an empty string since the path starts with a /
            url.id = url.host + pieces[1] + pieces[2];
            break;
        default:
            url.id = url.host;
            break;
    }

    return url;
}

exports.random = random;
exports.urlNormalize = urlNormalize;
