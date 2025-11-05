import { Hono } from "hono";
import { AppDataSource } from "../data-source1.js";
import * as fs from "fs";
import { Readable } from "stream";
import * as path from "path";

const router = new Hono();
interface ResultType {
  success: boolean;
  data: any;
  msg: string;
}

// t_board 에서 id 로 데이터 가져오기 완성 시키기
router.get("/img", async (c) => {
  let result: ResultType = {
    success: true,
    data: null,
    msg: "",
  };
  try {
    // 1. 쿼리 스트링에서 'id' 값 가져오기
    let data: any = c?.req?.query("data") ?? "";
    data = Buffer.from(data, "base64url").toString("utf8");
    data = JSON.parse(data);
    console.log(`# data: `, data);
    const dir = String(data?.dir ?? "");
    const mimetype = String(data?.mimetype ?? "image/jpeg");

    const fileStream = fs.createReadStream(dir);

    // 2. Node.js Stream을 웹 표준 ReadableStream으로 변환합니다.
    // Node.js 18 이상에서는 Readable.toWeb()을 사용할 수 있습니다.
    const webStream = Readable.toWeb(fileStream) as ReadableStream;

    // 3. Hono 응답을 반환합니다.
    // Content-Type 헤더를 설정하여 브라우저가 이미지로 인식하게 합니다.
    return c.body(webStream, 200, {
      "Content-Type": mimetype,
      // 스트리밍을 위해 chunked 인코딩을 사용할 수 있게 Transfer-Encoding 헤더를 명시
      "Transfer-Encoding": "chunked",
    });
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.msg = `서버 에러. ${error?.message}`;
    return c.json(result);
  }
});

export default router;
