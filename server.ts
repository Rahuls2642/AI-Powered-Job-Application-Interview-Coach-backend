import dotenv from "dotenv";
import app from "./app.js";
import { connectRedis } from "./src/lib/redis.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
