let client = null;
let connectionPromise = null;
let redisUnavailable = false;

function createRedisClient() {
  if (client || redisUnavailable) {
    return client;
  }

  try {
    const redis = require("redis");
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        connectTimeout: 750,
        reconnectStrategy: false,
      },
    });

    client.on("error", (err) => {
      console.log("Redis Error:", err.message);
    });
  } catch (error) {
    redisUnavailable = true;
    console.log("Redis unavailable:", error.message);
  }

  return client;
}

async function connect() {
  const activeClient = createRedisClient();

  if (!activeClient || redisUnavailable) {
    return null;
  }

  if (activeClient.isReady) {
    return activeClient;
  }

  if (!connectionPromise) {
    connectionPromise = activeClient.connect().catch((err) => {
      console.log("Redis unavailable:", err.message);
      connectionPromise = null;
      redisUnavailable = true;
      return null;
    });
  }

  return connectionPromise;
}

module.exports = new Proxy({}, {
  get(_target, property) {
    if (property === "connect") {
      return connect;
    }

    if (property === "isReady" || property === "isOpen") {
      return Boolean(client && client[property]);
    }

    return async (...args) => {
      const activeClient = await connect();
      const method = activeClient && activeClient[property];

      if (typeof method !== "function") {
        return null;
      }

      return method.apply(activeClient, args);
    };
  },
});
