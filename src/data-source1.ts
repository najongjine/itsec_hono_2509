// src/data-source1.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, "/entities/**/*.{ts,js}")],
  ssl: true,
});
