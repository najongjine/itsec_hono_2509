import { Hono } from "hono";
import { AppDataSource } from "../data-source1.js";
import { TBoard } from "../entities/TBoard.js";
import { TUser } from "../entities/TUser.js";
import * as utils from "../utils/utils.js";

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

router.post("/register", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();

    let username = String(body["username"] ?? "");
    username = username?.trim() ?? "";
    let password = String(body["password"] ?? "");
    password = password?.trim() ?? "";
    let real_name = String(body["real_name"] ?? "");
    real_name = real_name?.trim() ?? "";

    if (!username || !password) {
      result.success = false;
      result.msg = `유저네임과 패스워드를 입력해 주세요`;
      return c.json(result);
    }
    password = await utils.hashPassword(password);
    console.log(`password: ${password}`);
    if (real_name) real_name = utils.encryptData(real_name);
    console.log(`real_name: ${real_name}`);
    const userRepo = AppDataSource.getRepository(TUser);

    let user =
      (await userRepo.findOne({ where: { username: username } })) ??
      new TUser();
    if (user?.id) {
      result.success = false;
      result.msg = `이미 가입한 username 입니다`;
      return c.json(result);
    }
    console.log(`b4 save`);
    user.username = username;
    user.password = password;
    user.realName = real_name;

    user = await userRepo.save(user);
    // 순수한 JSObject 로 변환
    user = JSON.parse(JSON.stringify(user));

    let token = utils.generateToken(user, "90d");
    if (token) token = utils.encryptData(token);
    result.data = {
      userInfo: user,
      token: token,
    };
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

router.post("/login", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();

    let username = String(body["username"] ?? "");
    username = username?.trim() ?? "";
    let password = String(body["password"] ?? "");
    password = password?.trim() ?? "";

    if (!username || !password) {
      result.success = false;
      result.msg = `유저네임과 패스워드를 입력해 주세요`;
      return c.json(result);
    }

    const userRepo = AppDataSource.getRepository(TUser);

    let user =
      (await userRepo.findOne({
        where: { username: username },
      })) ?? new TUser();
    const bVaid = await utils.comparePassword(password, user?.password ?? "");
    if (!user?.id || !bVaid) {
      result.success = false;
      result.msg = `계정정보가 잘못됬습니다`;
      return c.json(result);
    }
    user.password = "";
    if (user?.realName) user.realName = utils.decryptData(user?.realName ?? "");
    // 순수한 JSObject 로 변환
    user = JSON.parse(JSON.stringify(user));

    let token = utils.generateToken(user, "90d");
    if (token) token = utils.encryptData(token);
    result.data = {
      userInfo: user,
      token: token,
    };
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default router;
