import { Hono } from "hono";
import { AppDataSource } from "../data-source1.js";
import { TBoard } from "../entities/TBoard.js";
import { TUser } from "../entities/TUser.js";
import { success } from "zod";

const board = new Hono();
interface ResultType {
  success: boolean;
  data: any;
  msg: string;
}
// Get list of boards
board.get("/", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const boardRepo = AppDataSource.getRepository(TBoard);
    let data = await boardRepo.find({ order: { createdDt: "DESC" } });
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default board;
