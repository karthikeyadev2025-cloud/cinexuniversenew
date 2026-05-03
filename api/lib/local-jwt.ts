import * as jose from "jose";
import { env } from "../lib/env";

const JWT_ALG = "HS256";

export type LocalAuthPayload = {
  userId: number;
  email: string;
  role: string;
};

export async function signLocalToken(payload: LocalAuthPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyLocalToken(token: string): Promise<LocalAuthPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    const { userId, email, role } = payload as unknown as LocalAuthPayload;
    if (!userId || !email) return null;
    return { userId: Number(userId), email, role };
  } catch {
    return null;
  }
}
