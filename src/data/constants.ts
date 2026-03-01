import type { NavLink } from "@/types";

export const SITE_NAME = "FORTE CUP";
export const SITE_DESCRIPTION =
  "Дизайнерская одноразовая посуда для дерзких кофеен. Двухслойные стаканы, эко-материалы и кастомная печать.";
export const SITE_URL = "https://fortecup.ru";

export const NAV_LINKS: NavLink[] = [
  { label: "Каталог", href: "/catalog" },
  { label: "Дизайн", href: "/custom-design" },
  {
    label: "Инфо",
    href: "#",
    children: [
      { label: "О нас", href: "/about" },
      { label: "Доставка", href: "/delivery" },
      { label: "Портфолио", href: "/portfolio" },
      { label: "Блог", href: "/blog" },
    ],
  },
  { label: "Контакты", href: "/contacts" },
];

export const CURRENCY_SYMBOL = "₽";

export const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABf/EAB8QAAEEAgIDAAAAAAAAAAAAAAEAAgMFEQQhBhITMf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmsOk5Dd1EEjbC0xPnYYzusjzqvGj7wrREH//2Q==";

// ─── Fallbacks for SiteSettings ──────────

export const SETTINGS_FALLBACKS: Record<string, string> = {
  heroTitle: "HOLD\n*THE LOUD*\n[BRAND]",
  heroImageUrl: "",
  heroSubtitle:
    "Дизайнерская одноразовая посуда для дерзких кофеен. Двухслойные стаканы, эко-материалы и кастомная печать твоего логотипа.",
  marqueeText:
    "/// ДВУХСЛОЙНЫЕ СТАКАНЫ /// ЭКО-МАТЕРИАЛЫ /// КАСТОМНАЯ ПЕЧАТЬ /// B2B ОПТОМ",
  contactPhone: "+7 (999) 123-45-67",
  contactEmail: "hello@fortecup.ru",
  contactAddress: "Москва, Россия",
  instagramUrl: "https://instagram.com",
  telegramUrl: "https://t.me",
};
