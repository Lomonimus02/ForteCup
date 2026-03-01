"use server";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  // Ищем пользователя с ролью ADMIN
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "ADMIN") {
    return { error: "Неверный email или пароль" };
  }

  // Проверяем пароль
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Неверный email или пароль" };
  }

  // Генерируем JWT и устанавливаем cookie
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  });

  // Редирект в админку
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/admin/login");
}
