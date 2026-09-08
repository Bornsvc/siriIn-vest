import { AuthPanel } from "@/features/auth";
import { Logo } from "@/shared/ui";

/**
 * The signed-out shell. Deliberately not the app shell: no Bridge Bar, no
 * rail, no tab bar — there is nothing to navigate yet. A brand panel states
 * what the product is, and the form column does the one job on the screen.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AuthPanel />

      <main className="flex min-w-0 flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto w-full max-w-[400px]">
          {/* The panel is hidden below lg, so the mark comes inline instead. */}
          <div className="mb-9 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
