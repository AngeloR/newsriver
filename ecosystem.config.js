module.exports = {
    apps : [
    {
        name      : 'API',
        script    : 'api.js',
        env: {
            PORT: 8000,
            NODE_ENV: 'dev',
            REDIS_URL: 'redis://localhost:6379'
        },
        env_production : {
            NODE_ENV: 'production'
        }
    },
    {
        name      : 'INGEST',
        script    : 'ingest.js'
    }
    ]
};
