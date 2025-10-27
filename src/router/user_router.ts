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
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

// t_board 에 데이터 추가&수정 기능 만들기
router.post("/register", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();

    let username = String(body["username"]);
    let password = String(body["password"]);
    let real_name = String(body["real_name"]);
    const userRepo = AppDataSource.getRepository(TUser);

    let user =
      (await userRepo.findOne({ where: { username: username } })) ??
      new TUser();
    if (user?.id) {
      result.success = false;
      result.msg = `이미 가입한 username 입니다`;
      return c.json(result);
    }

    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default router;
