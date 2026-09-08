import { ProfileProvider } from "@/features/auth";
import { BridgeBar, SideRail, TabBar, TopBar } from "@/features/shell";

/**
 * The signed-in shell. Everything inside it assumes a customer, so the profile
 * is loaded once here and the provider is what sends anyone without a valid
 * session back to the login screen.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ProfileProvider>
      <div className="min-h-screen">
        <BridgeBar />
        <div className="flex">
          <SideRail />
          <div className="min-w-0 flex-1">
            <TopBar />
            <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 sm:px-6 md:pb-12">
              {children}
            </main>
          </div>
        </div>
        <TabBar />
      </div>
    </ProfileProvider>
  );
}
