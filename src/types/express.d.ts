import { User } from "@supabase/supabase-js";
import "express";
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File;
    user?: {
      id: string;
    };
  }
}
