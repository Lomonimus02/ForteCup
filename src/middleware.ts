// =========================================
// FORTE CUP — Edge Middleware
// Защита /admin/* маршрутов через JWT
// =========================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("forte-cup-admin-secret-key-2024");
const AUTH_COOKIE = "forte-admin-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем страницу логина — она публичная
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Проверяем JWT-токен из cookie
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Проверяем роль ADMIN
    if (payload.role !== "ADMIN") {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    // Невалидный / истёкший токен
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
