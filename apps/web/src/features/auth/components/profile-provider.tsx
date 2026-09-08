"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/lib/api-client";
import { fetchProfile, type Profile } from "../lib/profile-api";
import { clearSession, getAccessToken } from "../lib/session";

interface ProfileState {
  profile: Profile | null;
  /** True until the first answer arrives — the shell draws a resting state. */
  loading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileState>({
  profile: null,
  loading: true,
  error: null,
});

/** The signed-in customer. Only meaningful inside the `(app)` shell. */
export function useProfile(): ProfileState {
  return useContext(ProfileContext);
}

/**
 * Loads the profile once for the whole signed-in shell.
 *
 * The greeting, the top bar and the account screen all want the same record;
 * fetching it here means one request per visit rather than one per component,
 * and one place that decides what "signed out" looks like.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    fetchProfile(token)
      .then((profile) => {
        if (!cancelled) setState({ profile, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        // The token outlived its hour, or was never ours. Either way there is
        // nothing to keep, and the login screen is the honest answer.
        if (error instanceof ApiError && error.code === "UNAUTHENTICATED") {
          clearSession();
          router.replace("/login");
          return;
        }

        setState({
          profile: null,
          loading: false,
          error:
            error instanceof ApiError
              ? error.message
              : "Couldn't load your account. Reload the page to try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <ProfileContext.Provider value={state}>{children}</ProfileContext.Provider>
  );
}
