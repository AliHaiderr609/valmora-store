import { SettingsClient } from "@/components/admin/settings-client";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
