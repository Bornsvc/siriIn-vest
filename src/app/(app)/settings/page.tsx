import type { Metadata } from "next";
import {
  AboutCard,
  DisplaySettings,
  NotificationSettings,
  SecuritySettings,
} from "@/features/account";
import { PageHeader } from "@/features/shell";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="ຕັ້ງຄ່າ"
        title="Settings"
        description="How the app reads, what it tells you, and who can get into it. Nothing here is saved in this build."
      />

      <div className="max-w-[640px] space-y-5">
        <DisplaySettings />
        <NotificationSettings />
        <SecuritySettings />
        <AboutCard />
      </div>
    </>
  );
}
