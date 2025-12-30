import dotenv from "dotenv";
import app from "./app.js";
import { connectRedis } from "./src/lib/redis.js";
import "dotenv/config";
process.env.JWT_SECRET ||= "test-secret";
process.env.REDIS_URL ||= "redis://localhost:6379";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
