import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AppDataSource } from "./data-source1.js";

const app = new Hono();

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
app.route("/api/board", board);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
