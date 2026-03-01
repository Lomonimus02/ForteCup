import Link from "next/link";
import { SITE_NAME, SETTINGS_FALLBACKS } from "@/data/constants";
import { getSiteSettings } from "@/lib/settings";

export async function Footer() {
  const settings = await getSiteSettings();

  const get = (key: string) =>
    settings[key] || SETTINGS_FALLBACKS[key] || "";

  const phone = get("contactPhone");
  const email = get("contactEmail");
  const address = get("contactAddress");
  const instagram = get("instagramUrl");
  const telegram = get("telegramUrl");

  return (
    <footer className="border-t-2 border-dark bg-accent px-10 py-20 text-dark">
      {/* Big brand */}
      <div className="text-center font-display text-[10vw] font-extrabold uppercase leading-none">
        {SITE_NAME}
      </div>

      {/* Contact grid */}
      <div className="mx-auto mt-14 grid max-w-[900px] grid-cols-1 gap-8 text-center sm:grid-cols-3">
        {phone && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Телефон
            </p>
            <Link
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="menu-link mt-1 block text-lg font-bold"
            >
              {phone}
            </Link>
          </div>
        )}
        {email && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Email
            </p>
            <Link
              href={`mailto:${email}`}
              className="menu-link mt-1 block text-lg font-bold"
            >
              {email}
            </Link>
          </div>
        )}
        {address && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">
              Адрес
            </p>
            <p className="mt-1 text-lg font-bold">{address}</p>
          </div>
        )}
      </div>

      {/* Social */}
      <div className="mt-10 flex justify-center gap-10 font-bold uppercase">
        {instagram && (
          <Link
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="menu-link"
          >
            Instagram
          </Link>
        )}
        {telegram && (
          <Link
            href={telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="menu-link"
          >
            Telegram
          </Link>
        )}
        {email && (
          <Link href={`mailto:${email}`} className="menu-link">
            Email
          </Link>
        )}
      </div>

      <p className="mt-10 text-center font-mono text-xs opacity-50">
        © {new Date().getFullYear()} DESIGNED WITH ATTITUDE. MOSCOW.
      </p>
    </footer>
  );
}
