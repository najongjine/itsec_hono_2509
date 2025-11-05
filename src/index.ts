import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source1.js";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const app = new Hono();
app.use(cors());

/** DB 연결 */
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
/** DB 연결 END */

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

import board from "./router/board_router.js";
import userRouter from "./router/user_router.js";
import streamRouter from "./router/stream_router.js";
app.route("/api/board", board);
app.route("/api/user", userRouter);
app.route("/api/stream", streamRouter);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
