const NodeCache = require('node-cache');

// Standard cache for 10 minutes, check for expiration every 2 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const cacheMiddleware = (duration) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        console.log(`[CACHE] Hit: ${key}`);
        return res.json(cachedResponse);
    } else {
        console.log(`[CACHE] Miss: ${key}`);
        res.originalJson = res.json;
        res.json = (body) => {
            cache.set(key, body, duration);
            res.originalJson(body);
        };
        next();
    }
};

module.exports = {
    cache,
    cacheMiddleware
};
