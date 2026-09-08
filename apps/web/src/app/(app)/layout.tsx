import { BridgeBar, SideRail, TabBar, TopBar } from "@/features/shell";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
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
  );
}
