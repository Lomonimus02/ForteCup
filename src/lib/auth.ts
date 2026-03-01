// =========================================
// FORTE CUP — JWT Auth Utilities
// jose-based JWT for Edge Runtime (middleware)
// =========================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/** JWT secret — в продакшене вынести в env */
const JWT_SECRET = new TextEncoder().encode("forte-cup-admin-secret-key-2024");

/** Название cookie */
export const AUTH_COOKIE = "forte-admin-token";

/** Время жизни токена — 7 дней */
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: string;
  name?: string;
}

/** Создать подписанный JWT */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/** Верифицировать JWT, вернуть payload или null */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/** Получить текущего пользователя из cookie (Server Component / Server Action) */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
