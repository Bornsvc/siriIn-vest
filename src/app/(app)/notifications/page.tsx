import { NOTIFICATIONS } from "@/mock/account";
import { PageHeader } from "@/features/shell";
import { NotificationCenter } from "@/features/notifications";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="ການແຈ້ງເຕືອນ"
        title="Notifications"
        description="Fills, deposits, price alerts and product news. The market you trade opens at 20:30 Vientiane time, so most of this arrives in your evening."
      />
      <NotificationCenter notifications={NOTIFICATIONS} />
    </>
  );
}
