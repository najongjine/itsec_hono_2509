import { Hono } from "hono";
import { AppDataSource } from "../data-source1.js";
import { TBoard } from "../entities/TBoard.js";
import { TUser } from "../entities/TUser.js";
import { success } from "zod";

const router = new Hono();
interface ResultType {
  success: boolean;
  data: any;
  msg: string;
}
// Get list of boards
router.get("/", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const boardRepo = AppDataSource.getRepository(TBoard);
    let data = await boardRepo.find({ order: { createdDt: "DESC" } });
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

// t_board 에 데이터 추가&수정 기능 만들기
router.post("/upsert", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();
    let id = Number(body["id"] ?? 0);
    let title = String(body["title"]);
    let content = String(body["content"]);
    const boardRepo = AppDataSource.getRepository(TBoard);

    let newBoard =
      (await boardRepo.findOne({ where: { id: id } })) ?? new TBoard();
    newBoard.title = title;
    newBoard.content = content;

    newBoard = await boardRepo.save(newBoard);
    result.data = newBoard;

    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default router;
