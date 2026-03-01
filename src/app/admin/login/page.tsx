"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            FORTE CUP
          </h1>
          <p className="text-neutral-500 text-sm mt-1 tracking-widest uppercase">
            Admin Panel
          </p>
        </div>

        {/* Login Form */}
        <form
          action={formAction}
          className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-5"
        >
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-600 transition"
              placeholder="admin@fortecup.ru"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-400">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-600 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            {pending ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-neutral-700 text-xs mt-6">
          &copy; {new Date().getFullYear()} Forte Cup. Все права защищены.
        </p>
      </div>
    </div>
  );
}
