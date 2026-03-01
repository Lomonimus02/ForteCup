import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description: "Условия доставки продукции FORTE CUP по Москве и России.",
};

const deliveryOptions = [
  {
    title: "Доставка по Москве",
    time: "1–2 рабочих дня",
    details: "Бесплатно при заказе от 15 000 ₽. Доставляем собственной службой до двери. Стоимость при меньшем заказе — 500 ₽.",
  },
  {
    title: "Доставка по МО",
    time: "2–3 рабочих дня",
    details: "Стоимость рассчитывается индивидуально в зависимости от удалённости. Бесплатно при заказе от 30 000 ₽.",
  },
  {
    title: "Доставка по России",
    time: "3–7 рабочих дней",
    details: "Отправляем транспортными компаниями (СДЭК, Деловые Линии, ПЭК). Стоимость — по тарифам ТК. Возможна доставка до терминала или до двери.",
  },
  {
    title: "Самовывоз",
    time: "В день заказа",
    details: "Забрать заказ можно со склада в Москве после подтверждения готовности менеджером. Адрес и время работы уточняйте.",
  },
];

const paymentMethods = [
  { title: "Безналичный расчёт", desc: "Оплата по счёту для юридических лиц. Работаем с НДС и без НДС." },
  { title: "Оплата картой", desc: "Visa, Mastercard, МИР — через защищённый платёжный шлюз." },
  { title: "Наличный расчёт", desc: "Доступен при самовывозе со склада." },
];

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">Главная</Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">Доставка и оплата</span>
      </nav>

      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        Доставка
      </h1>
      <p className="mt-4 max-w-xl text-lg text-dark/60">
        Отгружаем заказы оперативно. Доставляем по всей России.
      </p>

      {/* Delivery options */}
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {deliveryOptions.map((opt) => (
          <div
            key={opt.title}
            className="rounded-[36px] border-2 border-dark p-7 transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">{opt.title}</h3>
              <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase text-dark">
                {opt.time}
              </span>
            </div>
            <p className="mt-4 text-sm text-dark/60 leading-relaxed">{opt.details}</p>
          </div>
        ))}
      </div>

      {/* Payment */}
      <h2 className="mt-20 font-display text-4xl font-extrabold uppercase">Оплата</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {paymentMethods.map((pm) => (
          <div
            key={pm.title}
            className="rounded-3xl border-2 border-dark p-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-wide">{pm.title}</h3>
            <p className="mt-3 text-sm text-dark/60">{pm.desc}</p>
          </div>
        ))}
      </div>

      {/* Important info */}
      <div className="mt-16 rounded-[36px] bg-dark px-8 py-10 text-light">
        <h3 className="font-display text-xl font-extrabold uppercase">Важно знать</h3>
        <ul className="mt-5 space-y-3 text-sm text-light/70">
          <li className="flex gap-3">
            <span className="mt-0.5 text-accent">•</span>
            Минимальный заказ — 1 коробка (количество штук зависит от товара).
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-accent">•</span>
            Сроки производства кастомной печати — 5–10 рабочих дней.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-accent">•</span>
            При заказе от 100 000 ₽ — персональный менеджер и приоритетная отгрузка.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-accent">•</span>
            Возврат и обмен — в течение 14 дней при сохранении товарного вида.
          </li>
        </ul>
      </div>
    </div>
  );
}
