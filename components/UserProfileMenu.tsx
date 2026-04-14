"use client";

import { useEffect, useMemo, useState } from "react";
import APIKeyManager from "@/components/APIKeyManager";

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type Tier = "FREE" | "ADS_FREE" | "LOCAL" | "BYOK" | "HOSTED_AI";
type ExplanationProvider =
  | "OLLAMA"
  | "OPENAI"
  | "GEMINI"
  | "MISTRAL"
  | "DEEPSEEK"
  | "HOSTED";

const PROVIDER_OPTIONS: Array<{
  id: ExplanationProvider;
  name: string;
  subtitle: string;
  allowedTiers: Tier[];
}> = [
  {
    id: "OLLAMA",
    name: "Ollama (Local)",
    subtitle: "Run locally on your machine",
    allowedTiers: ["LOCAL"],
  },
  {
    id: "OPENAI",
    name: "OpenAI GPT",
    subtitle: "Requires your API key",
    allowedTiers: ["BYOK"],
  },
  {
    id: "GEMINI",
    name: "Google Gemini",
    subtitle: "Requires your API key",
    allowedTiers: ["BYOK"],
  },
  {
    id: "MISTRAL",
    name: "Mistral AI",
    subtitle: "Requires your API key",
    allowedTiers: ["BYOK"],
  },
  {
    id: "DEEPSEEK",
    name: "DeepSeek",
    subtitle: "Requires your API key",
    allowedTiers: ["BYOK"],
  },
  {
    id: "HOSTED",
    name: "Ditectrev AI",
    subtitle: "Premium managed service",
    allowedTiers: ["HOSTED_AI"],
  },
];

export function UserProfileMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tier, setTier] = useState<Tier>("FREE");
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [providerSaveMessage, setProviderSaveMessage] = useState<string | null>(
    null
  );
  const [cancelling, setCancelling] = useState(false);
  const [selectedExplanationProvider, setSelectedExplanationProvider] =
    useState<ExplanationProvider>("OLLAMA");
  const [selectedProvider, setSelectedProvider] = useState<
    "OPENAI" | "GEMINI" | "MISTRAL" | "DEEPSEEK"
  >("OPENAI");

  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email || "U";
    return source.slice(0, 1).toUpperCase();
  }, [user]);

  async function refreshAuthState() {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      if (!authRes.ok) {
        setUser(null);
        setTier("FREE");
        return;
      }
      const authData = (await authRes.json()) as { user?: AuthUser };
      if (!authData.user) {
        setUser(null);
        setTier("FREE");
        return;
      }
      setUser(authData.user);

      const tierRes = await fetch("/api/subscription/current", {
        method: "GET",
        credentials: "include",
        headers: { "x-user-id": authData.user.id },
      });
      if (tierRes.ok) {
        const tierData = (await tierRes.json()) as {
          data?: { tier?: Tier };
        };
        setTier(tierData.data?.tier ?? "FREE");
        setActiveUntil(null);
      } else {
        setTier("FREE");
        setActiveUntil(null);
      }
    } catch {
      setUser(null);
      setTier("FREE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAuthState();
    const onAuthChanged = () => void refreshAuthState();
    if (typeof window !== "undefined") {
      window.addEventListener("auth-state-changed", onAuthChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-state-changed", onAuthChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedProvider = localStorage.getItem(
      "explanations_provider"
    ) as ExplanationProvider | null;
    if (storedProvider) {
      setSelectedExplanationProvider(storedProvider);
    }
    const storedUntil = localStorage.getItem("subscription_active_until");
    if (storedUntil) {
      setActiveUntil(storedUntil);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_success") === "true") {
      void refreshAuthState();
    }
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setTier("FREE");
      setOpen(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-state-changed"));
      }
    }
  }

  const isProviderAllowed = (provider: ExplanationProvider) =>
    PROVIDER_OPTIONS.find((p) => p.id === provider)?.allowedTiers.includes(
      tier
    ) ?? false;

  const hasPaidPlan = tier !== "FREE";
  const canManageApiKeys = tier === "BYOK";

  async function handleSaveProvider() {
    if (!isProviderAllowed(selectedExplanationProvider)) {
      setProviderSaveMessage(
        "This provider is not available in your current tier."
      );
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "explanations_provider",
        selectedExplanationProvider
      );
    }
    setProviderSaveMessage("Explanation provider saved.");
  }

  async function handleCancelSubscription() {
    if (!user || !hasPaidPlan) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "DELETE",
        credentials: "include",
        headers: { "x-user-id": user.id },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setProviderSaveMessage(data.error ?? "Failed to cancel subscription.");
        return;
      }
      setProviderSaveMessage(
        "Subscription cancelled. Access remains until the end of billing period."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Checking...
      </span>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          setProviderSaveMessage(null);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-auth-prompt"));
            window.location.assign("/pricing?signin=1");
          }
        }}
        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-expanded={open}
        aria-label="Open user profile menu"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden lg:inline text-xs text-gray-700 dark:text-gray-300">
          {user.email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[95vw] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-[10010] p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {user.name || "Profile"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                Tier: {tier}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active until:{" "}
                {activeUntil
                  ? new Date(activeUntil).toLocaleDateString()
                  : hasPaidPlan
                    ? "End of current billing period"
                    : "No active paid plan"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>

          <div className="max-h-[50vh] overflow-auto pr-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Explanations Provider
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDER_OPTIONS.map((provider) => {
                  const allowed = provider.allowedTiers.includes(tier);
                  const selected = selectedExplanationProvider === provider.id;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      disabled={!allowed}
                      onClick={() =>
                        setSelectedExplanationProvider(provider.id)
                      }
                      className={`rounded-lg border p-2 text-left transition-colors ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700"
                      } ${
                        !allowed
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-blue-400"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {provider.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {provider.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => void handleSaveProvider()}
                className="text-xs rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
              >
                Save explanations provider
              </button>
            </div>

            {canManageApiKeys ? (
              <APIKeyManager
                selectedProvider={selectedProvider}
                onProviderSelect={setSelectedProvider}
              />
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  API key management is available on the BYOK tier.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <a
                href="/pricing"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage subscription
              </a>
              {hasPaidPlan && (
                <button
                  type="button"
                  onClick={() => void handleCancelSubscription()}
                  disabled={cancelling}
                  className="text-xs rounded-md border border-red-500 text-red-600 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel subscription"}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-xs rounded-md bg-red-600 text-white px-3 py-1.5 hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
          {providerSaveMessage && (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {providerSaveMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
