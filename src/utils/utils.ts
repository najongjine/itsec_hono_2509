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

// JWT 검증
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
