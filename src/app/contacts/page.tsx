import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { SETTINGS_FALLBACKS } from "@/data/constants";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с FORTE CUP — телефон, email, адрес.",
};

function s(settings: Record<string, string>, key: string): string {
  return settings[key] || SETTINGS_FALLBACKS[key] || "";
}

export default async function ContactsPage() {
  const settings = await getSiteSettings();

  const phone = s(settings, "contactPhone");
  const email = s(settings, "contactEmail");
  const address = s(settings, "contactAddress");
  const instagram = s(settings, "instagramUrl");
  const telegram = s(settings, "telegramUrl");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">Главная</Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">Контакты</span>
      </nav>

      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        Контакты
      </h1>
      <p className="mt-4 max-w-xl text-lg text-dark/60">
        Готовы обсудить ваш заказ. Свяжитесь удобным способом.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Contact cards */}
        <div className="space-y-5">
          {/* Phone */}
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="block rounded-[36px] border-2 border-dark p-7 transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-dark/40">Телефон</span>
            <p className="mt-2 font-display text-2xl font-extrabold">{phone}</p>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="block rounded-[36px] border-2 border-dark p-7 transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-dark/40">Email</span>
            <p className="mt-2 font-display text-2xl font-extrabold">{email}</p>
          </a>

          {/* Address */}
          <div className="rounded-[36px] border-2 border-dark p-7">
            <span className="text-xs font-bold uppercase tracking-wider text-dark/40">Адрес</span>
            <p className="mt-2 font-display text-2xl font-extrabold">{address}</p>
          </div>

          {/* Social */}
          <div className="flex gap-4">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border-2 border-dark py-4 text-center text-xs font-bold uppercase tracking-wide transition-colors hover:bg-dark hover:text-accent"
              >
                Instagram
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border-2 border-dark py-4 text-center text-xs font-bold uppercase tracking-wide transition-colors hover:bg-dark hover:text-accent"
              >
                Telegram
              </a>
            )}
          </div>
        </div>

        {/* Map placeholder */}
        <div
          className="min-h-[400px] overflow-hidden border-2 border-dark bg-neutral-200"
          style={{ borderRadius: "var(--radius-apple)" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d35940.73997519573!2d37.5673!3d55.7558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54afc73d4b0c9%3A0x3d44d6cc5757cf4c!2sMoscow!5e0!3m2!1sen!2sru!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 400 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Карта — FORTE CUP"
          />
        </div>
      </div>

      {/* Working hours */}
      <div className="mt-14 rounded-[36px] bg-dark px-8 py-10 text-light">
        <h3 className="font-display text-xl font-extrabold uppercase">Режим работы</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-light/40">Пн — Пт</span>
            <p className="mt-1 text-lg font-bold">9:00 — 18:00</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-light/40">Суббота</span>
            <p className="mt-1 text-lg font-bold">10:00 — 15:00</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-light/40">Воскресенье</span>
            <p className="mt-1 text-lg font-bold">Выходной</p>
          </div>
        </div>
      </div>
    </div>
  );
}
