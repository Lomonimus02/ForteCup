import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О компании",
  description: "FORTE CUP — производство дизайнерской одноразовой посуды для кофеен.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">Главная</Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">О нас</span>
      </nav>

      {/* Hero */}
      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        О компании
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-dark/60">
        Мы — FORTE CUP. Производим и поставляем дизайнерскую одноразовую посуду для кофеен, ресторанов и сетей по всей России.
      </p>

      {/* Content blocks */}
      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-3xl font-extrabold uppercase">
            Наша история
          </h2>
          <div className="mt-6 space-y-4 text-dark/70 leading-relaxed">
            <p>
              FORTE CUP была основана в Москве с простой идеей: одноразовая посуда
              может быть не только функциональной, но и красивой. Мы верим, что каждая
              чашка кофе заслуживает достойной подачи.
            </p>
            <p>
              Начав с небольших партий двухслойных стаканов для локальных кофеен,
              мы выросли в полноценного B2B-поставщика с собственным производством.
              Сегодня мы обслуживаем сотни заведений — от камерных кофеен до крупных сетей.
            </p>
            <p>
              Наша команда — это дизайнеры, технологи и логисты, объединённые
              страстью к качеству и вниманием к деталям. Каждый продукт проходит
              строгий контроль перед отправкой.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-extrabold uppercase">
            Почему мы
          </h2>
          <div className="mt-6 space-y-5">
            {[
              { title: "Собственное производство", desc: "Полный цикл от дизайна до упаковки. Контролируем качество на каждом этапе." },
              { title: "Эко-материалы", desc: "Используем сертифицированный картон и безопасные краски. Заботимся о планете." },
              { title: "Кастомная печать", desc: "Нанесём ваш логотип на любой продукт. Тираж от 1 000 штук." },
              { title: "Быстрая доставка", desc: "Склад в Москве, отгрузка за 1–3 дня. Доставка по всей РФ." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border-2 border-dark p-6 transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide">{item.title}</h3>
                <p className="mt-2 text-sm text-dark/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-[36px] border-2 border-dark bg-dark px-8 py-14 text-center text-light">
        <h2 className="font-display text-3xl font-extrabold uppercase lg:text-4xl">
          Хотите работать с нами?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-light/60">
          Свяжитесь для обсуждения оптовых условий и кастомного брендирования.
        </p>
        <Link
          href="/contacts"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-wide text-dark transition-transform hover:scale-105"
        >
          Связаться
        </Link>
      </div>
    </div>
  );
}
