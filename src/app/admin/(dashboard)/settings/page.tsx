import { getSettings } from "./actions";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Настройки
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Глобальные тексты и контакты сайта
        </p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
