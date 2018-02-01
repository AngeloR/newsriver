module.exports = {
    apps: [
    {
        name: 'API',
        script: 'api.js',
        env_dev: {
            PORT: 8000,
            NODE_ENV: 'dev',
            REDIS_URL: 'redis://localhost:6379'
        },
        env_prod: {}
    },
    {
        name: 'INGEST',
        script: 'ingest.js',
        env_dev: {},
        env_prod: {}
    }
    ]
};
