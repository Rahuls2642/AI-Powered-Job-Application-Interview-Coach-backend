import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,                
    rejectUnauthorized: false, 
  },
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", err => {
  console.error("Redis error:", err.message);
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    console.log("Redis connecting...");
    await redis.connect();
  }
};
