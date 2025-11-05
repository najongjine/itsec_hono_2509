/**
npm install hono jsonwebtoken bcrypt
npm install -D typescript ts-node @types/node @types/jsonwebtoken @types/bcrypt
 */
//@ts-ignore
import bcrypt from "bcrypt";
//@ts-ignore
import jwt from "jsonwebtoken";
//@ts-ignore
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// 🔑 키 길이를 AES-256-CBC 요구사항인 32바이트로 맞추는 유틸리티 함수
// 길이가 부족하면 0x00으로 패딩하고, 초과하면 잘라냅니다. (보안 경고)
const getEncryptionKeyBuffer = (): Buffer => {
  const KEY_BYTE_LENGTH = 32;
  let keyBuffer = Buffer.from(ENCRYPTION_KEY, "utf8");

  if (keyBuffer.length === KEY_BYTE_LENGTH) {
    return keyBuffer;
  }

  if (keyBuffer.length > KEY_BYTE_LENGTH) {
    // 32바이트 초과 시, 앞 부분만 사용 (잘라냄)
    return keyBuffer.subarray(0, KEY_BYTE_LENGTH);
  } else {
    // 32바이트 미달 시, 0으로 채워서 (패딩) 32바이트를 만듭니다.
    const padding = Buffer.alloc(KEY_BYTE_LENGTH - keyBuffer.length, 0);
    return Buffer.concat([keyBuffer, padding]);
  }
};

const JWT_SECRET = String(process.env.JWT_SECRET);
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your_32_byte_encryption_key_123456"; // 32 bytes
const ENCRYPTION_KEY_BUFFER = getEncryptionKeyBuffer();
const IV_LENGTH = 16; // AES block size

// 단방향 암호화: 비밀번호 해시 생성
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 단방향 암호화: 비밀번호 검증
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// 양방향 암호화: 데이터 암호화
export const encryptData = (data: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_BUFFER,
    iv
  );
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// 양방향 암호화: 데이터 복호화
export const decryptData = (encryptedData: string): string => {
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY_BUFFER,
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// JWT 생성
export const generateToken = (
  payload: any,
  expiresIn: string = "1h"
): string => {
  //@ts-ignore
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/** JWT 검증. return := payload */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// JWT 해독 (검증 없이 페이로드만 추출)
export const decodeToken = (token: string): object | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

/**
 * 현재 시간(밀리초)과 UUID를 조합하여 파일 이름으로 안전하게 사용할 수 있는 문자열을 생성합니다.
 * 생성된 문자열의 길이는 255자 미만입니다.
 * (UUID: 36자, 밀리초: 약 13자, 구분자: 1자 = 최대 약 50자)
 * * @returns {string} 조합된 파일 이름 문자열 (예: "1730635200000-a1b2c3d4-e5f6-4000-8000-000000000000")
 */
export function createUniqueFileName(): string {
  // 1. 현재 시간을 밀리초 단위로 가져옵니다.
  const timestamp = Date.now().toString();

  // 2. UUID v4를 생성합니다. (예: "a1b2c3d4-e5f6-4000-8000-000000000000")
  // 이 문자열은 파일 이름으로 안전하게 사용될 수 있는 하이픈을 포함합니다.
  const uniqueId = uuidv4();

  // 3. 두 값을 하이픈(-)으로 연결합니다.
  const uniqueFileName = `${timestamp}-${uniqueId}`;

  // 문자열 길이 확인 (255자 미만은 확실히 만족합니다)
  // console.log(`생성된 파일 이름: ${uniqueFileName}, 길이: ${uniqueFileName.length}`);

  return uniqueFileName;
}

/**
 * 이미지 경로가 폴더로 되있으면, 이걸 서버에서 직접 스트리밍 하는 주소로 바꿉니다.
 * 해당 프로젝트 게시판 전용으로 만들어졌습니다. 범용 컴포넌트 아닙니다.
 * localhost:3000 부분은 알아서 수정 하세요.
 */
export function makeBoardImgURL(data: any): string {
  try {
    console.log(`# mkburl data: `, data);
    let metaData: any = {};
    metaData.dir = data?.imgurl ?? "";
    metaData.mimetype = data?.minetype ?? "";
    metaData = JSON.stringify(metaData);
    metaData = Buffer.from(metaData).toString("base64url");
    let imgurl = `http://localhost:3000/api/stream/img?data=${metaData}`;
    return imgurl;
  } catch (error: any) {
    console.log(`# mkburl data err: `, data);
    return "/no_img.jpg";
  }
}
/**
 * 문자열이 일반적인 폴더/파일 경로 형식인지 검사합니다.
 * 이 정규표현식은 완벽한 유효성 검사(실제 파일 시스템 규칙)가 아닌,
 * 경로 구조(슬래시, 점, 파일명 등)를 포함하는지 확인하는 데 중점을 둡니다.
 * @param pathString 검사할 문자열
 * @returns 경로 형식인 경우 true, 아니면 false
 */
export function isPathFormat(pathString: string): boolean {
  if (typeof pathString !== "string" || pathString.trim() === "") {
    return false;
  }

  // 포괄적인 경로 형식 정규표현식
  // 1. 드라이브 문자 (C:\) 또는 유닉스 루트 (/)로 시작
  // 2. 경로 구분자 (/, \)와 일반적인 문자(문자, 숫자, 하이픈, 언더바, 마침표) 포함
  // 3. UNC 경로 (\\server\share)도 허용
  const pathRegex = new RegExp(
    /^((?:[a-zA-Z]:)?[\\\/]|\.{1,2}[\\\/]?|(?:[a-zA-Z0-9_-]+\/|\\)+|(?:[a-zA-Z]:))?(?:[a-zA-Z0-9_\-.\s]+[\\\/]?)*[a-zA-Z0-9_\-.\s]+$/,
    "i" // 대소문자 구분 없음
  );

  // 경로에 '?'나 '*' 같은 glob 문자가 포함된 경우를 단순 경로로 간주하지 않을 수 있습니다.
  // 여기서는 일반적인 경로 형식만 확인합니다.
  return pathRegex.test(pathString);
}
