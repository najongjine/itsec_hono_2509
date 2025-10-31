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
    const page = Number(c?.req?.query("page") ?? 1);
    const item_limit = Number(c?.req?.query("item_limit") ?? 1000);
    const offset = (page - 1) * item_limit;
    const boardRepo = AppDataSource.getRepository(TBoard);
    let data: any = await AppDataSource.query(
      `
          SELECT
          b.id as board_id
          ,b.user_id
          ,b.created_dt as board_created_dt
          ,b.updated_dt as board_updated_dt
          ,b.title
          ,b.content
          ,u.uid
          ,u.profile_url
          ,u.email
          ,u.display_name as user_display_name
          FROM t_board as b
          LEFT JOIN t_user as u ON u.id = b.user_id
          ORDER BY b.created_dt DESC
          LIMIT $1 
          OFFSET $2
          `,
      [item_limit, offset]
    );
    //let data = await boardRepo.find({ order: { createdDt: "DESC" } });
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

// t_board 에서 id 로 데이터 가져오기 완성 시키기
board.get("/get_memo_by_id", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    // 1. 쿼리 스트링에서 'id' 값 가져오기
    const id = Number(c?.req?.query("id") ?? 0);
    const boardRepo = AppDataSource.getRepository(TBoard);
    let data = await boardRepo.findOne({ where: { id: id } });
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

// t_board 에 데이터 추가&수정 기능 만들기
board.post("/upsert", async (c) => {
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

// t_board 에 데이터 삭제
board.post("/delete", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();
    let id = Number(body["id"] ?? 0);
    console.log(` delete id: ${id}`);

    // TypeORM의 transaction을 사용하여 데이터베이스 작업을 묶습니다.
    const deleteResult = await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // Raw SQL 쿼리를 사용하여 데이터 삭제
        // transactionalEntityManager를 사용하여 트랜잭션 내에서 쿼리 실행
        const rawDeleteResult = await transactionalEntityManager.query(
          `DELETE FROM t_board WHERE id = $1`,
          [id]
        );
        return rawDeleteResult;
      }
    );
    result.data = deleteResult;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default board;
