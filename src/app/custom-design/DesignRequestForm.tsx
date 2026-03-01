"use client";

import { useState, useTransition } from "react";
import { submitDesignRequest } from "./actions";
import toast from "react-hot-toast";

export function DesignRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    quantity: "",
    comment: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitDesignRequest(form);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Заявка отправлена!");
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-[36px] border-2 border-dark bg-accent px-8 py-16 text-center">
        <h3 className="font-display text-3xl font-extrabold uppercase">
          Спасибо!
        </h3>
        <p className="mt-4 text-dark/70">
          Мы получили вашу заявку и свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[36px] border-2 border-dark p-8 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-dark/40 mb-2">
            Имя *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ваше имя"
            className="w-full rounded-2xl border-2 border-dark bg-transparent px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-accent placeholder:text-dark/30"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-dark/40 mb-2">
            Телефон *
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="+7 (999) 123-45-67"
            className="w-full rounded-2xl border-2 border-dark bg-transparent px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-accent placeholder:text-dark/30"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-dark/40 mb-2">
          Тираж
        </label>
        <input
          type="text"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Например: 5 000 стаканов"
          className="w-full rounded-2xl border-2 border-dark bg-transparent px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-accent placeholder:text-dark/30"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-dark/40 mb-2">
          Комментарий
        </label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          rows={4}
          placeholder="Расскажите о вашем проекте..."
          className="w-full rounded-2xl border-2 border-dark bg-transparent px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-accent placeholder:text-dark/30 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-dark px-8 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Отправка..." : "Отправить заявку"}
      </button>
    </form>
  );
}
