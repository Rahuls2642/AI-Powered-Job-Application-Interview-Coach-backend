import { createClient } from "redis";
import "dotenv/config";
process.env.REDIS_URL ||= "redis://localhost:6379";
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
