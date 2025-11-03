import { Hono } from "hono";
import { AppDataSource } from "../data-source1.js";
import { TBoard } from "../entities/TBoard.js";
import { TUser } from "../entities/TUser.js";
import { writeFile } from "fs/promises";
import { join, extname } from "path";
import * as utils from "../utils/utils.js";

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

board.post("/img", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    const body = await c?.req?.parseBody();
    let imgs: any = body["imgs"];

    if (imgs) {
      const filesArray: File[] = Array.isArray(imgs) ? imgs : [imgs];
      const results = await Promise.all(
        filesArray.map(async (file) => {
          // 파일의 이름, 타입, 크기 등에 접근할 수 있습니다.
          console.log(
            `파일 이름: ${file.name}, 타입: ${file.type}, 크기: ${file.size} bytes`
          );

          // 2. 파일 데이터를 Node.js Buffer로 변환
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 3. 저장할 파일 경로 생성 (중복 방지를 위해 타임스탬프 등을 사용하는 것을 권장)
          const ext = extname(file.name);
          let uniqueFileName = utils.createUniqueFileName();
          uniqueFileName = `${uniqueFileName}${ext}`;
          const savePath = join(process.env.UPLOAD_DIR, uniqueFileName);

          // 4. 하드디스크에 파일 저장
          await writeFile(savePath, buffer);

          console.log(`파일 저장 완료: ${savePath}`);

          return {
            name: file.name,
            size: file.size,
            type: file.type,
            uniqueFileName: uniqueFileName,
            path: savePath, // 저장된 경로를 응답에 포함
          };
        })
      );
      result.data = results;
    }

    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default board;
