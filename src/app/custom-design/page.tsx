import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DesignRequestForm } from "./DesignRequestForm";
import { Package, Paintbrush, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Индивидуальный дизайн",
  description:
    "Нанесём ваш логотип на стаканы FORTE CUP. Тираж от 1 000 штук, бесплатный макет, сроки от 5 дней.",
};

const advantages = [
  {
    title: "Тираж от 1 000 шт",
    desc: "Минимальный заказ всего 1 000 стаканов. Идеально для старта и тестирования дизайна.",
    icon: Package,
  },
  {
    title: "Бесплатный макет",
    desc: "Наш дизайнер подготовит макет с вашим логотипом бесплатно. Утверждаете — запускаем.",
    icon: Paintbrush,
  },
  {
    title: "Сроки от 5 дней",
    desc: "Производство и печать от 5 рабочих дней. Срочные заказы обсуждаются индивидуально.",
    icon: Zap,
  },
];

const steps = [
  { num: "01", title: "Заявка", desc: "Оставляете заявку на сайте или по телефону" },
  { num: "02", title: "Макет", desc: "Дизайнер готовит макет с вашим логотипом" },
  { num: "03", title: "Утверждение", desc: "Вы подтверждаете макет и оплачиваете" },
  { num: "04", title: "Производство", desc: "Печатаем тираж на нашем оборудовании" },
  { num: "05", title: "Доставка", desc: "Отправляем готовую продукцию вам" },
];

export default async function CustomDesignPage() {
  const portfolioWorks = await prisma.portfolio.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div>
      {/* ─── Hero ─────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-dark mb-6">
              Кастомная печать
            </span>
            <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl leading-[0.95]">
              Твой бренд
              <br />
              <span className="underline decoration-accent decoration-[6px] underline-offset-[6px]">
                на стакане
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-dark/60 leading-relaxed">
              Нанесём логотип вашей кофейни, ресторана или бренда на двухслойные
              стаканы FORTE CUP. Полноцветная печать, премиум качество.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#request"
                className="inline-block rounded-full bg-dark px-8 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-transform hover:scale-105"
              >
                Рассчитать тираж
              </a>
              <a
                href="#works"
                className="inline-block rounded-full border-2 border-dark px-8 py-4 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-dark hover:text-accent"
              >
                Примеры работ
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[36px] border-2 border-dark bg-dark/5 flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <p className="font-display text-7xl font-extrabold uppercase tracking-tight text-dark/8 lg:text-8xl">
                  Forte
                </p>
                <p className="text-xs font-bold text-dark/30 mt-3 uppercase tracking-[0.3em]">
                  Ваш логотип здесь
                </p>
              </div>
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-accent border-2 border-dark hidden lg:flex items-center justify-center">
              <span className="font-display text-xs font-extrabold uppercase text-dark leading-tight text-center">
                от 1000
                <br />
                шт
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Advantages ───────────────────────── */}
      <section className="bg-dark py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-5">
          <h2 className="font-display text-4xl font-extrabold uppercase text-light text-center lg:text-5xl">
            Почему мы
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {advantages.map((adv) => (
              <div
                key={adv.title}
                className="rounded-[36px] border-2 border-neutral-700 p-8 text-center transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent">
                  <adv.icon size={24} className="text-accent" strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold uppercase text-light">
                  {adv.title}
                </h3>
                <p className="mt-3 text-sm text-light/50 leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:py-20">
        <h2 className="font-display text-4xl font-extrabold uppercase text-center lg:text-5xl">
          Как это работает
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-3xl border-2 border-dark p-6 relative"
            >
              <span className="font-display text-4xl font-extrabold text-accent/30">
                {step.num}
              </span>
              <h3 className="mt-2 text-sm font-bold uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="mt-2 text-xs text-dark/50 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Portfolio Works ──────────────────── */}
      {portfolioWorks.length > 0 && (
        <section id="works" className="bg-dark/5 py-16 lg:py-20">
          <div className="mx-auto max-w-[1400px] px-5">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-4xl font-extrabold uppercase lg:text-5xl">
                Примеры работ
              </h2>
              <Link
                href="/portfolio"
                className="text-sm font-bold uppercase tracking-wide text-dark/50 hover:text-dark transition"
              >
                Все работы →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {portfolioWorks.map((work) => (
                <div
                  key={work.id}
                  className="rounded-[36px] border-2 border-dark overflow-hidden bg-white group"
                >
                  <div className="aspect-[4/3] bg-dark/10 overflow-hidden">
                    {work.imageUrl ? (
                      <Image
                        src={work.imageUrl}
                        alt={work.clientName}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark/20">
                        <span className="font-display text-2xl font-bold">FORTE</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-sm uppercase tracking-wide">
                      {work.clientName}
                    </h3>
                    {work.description && (
                      <p className="mt-1 text-xs text-dark/50 line-clamp-2">
                        {work.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Request Form ─────────────────────── */}
      <section id="request" className="mx-auto max-w-[1400px] px-5 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase lg:text-5xl">
              Оставить
              <br />
              заявку
            </h2>
            <p className="mt-4 text-dark/60 max-w-md leading-relaxed">
              Заполните форму, и мы свяжемся с вами в течение рабочего дня для
              обсуждения деталей вашего заказа.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold">
                  ✓
                </span>
                <span className="text-sm text-dark/70">Бесплатная консультация</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold">
                  ✓
                </span>
                <span className="text-sm text-dark/70">Макет за 1-2 дня</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold">
                  ✓
                </span>
                <span className="text-sm text-dark/70">Гарантия качества</span>
              </div>
            </div>
          </div>
          <DesignRequestForm />
        </div>
      </section>
    </div>
  );
}
