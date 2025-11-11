"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { useMemo, useState } from "react";

const DEFAULT_CHATBOT_URL = "http://localhost:8000/chat/ask/";

/**
 * Floating launcher that reveals the customer chat assistant once the user is authenticated.
 * The actual chat endpoint will be injected later through NEXT_PUBLIC_CUSTOMER_CHATBOT_URL.
 */
export function ChatBotOverlay() {
  const { isAuthenticated, loading, customer } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);

  const chatbotUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_CUSTOMER_CHATBOT_URL?.trim() ||
      DEFAULT_CHATBOT_URL,
    [],
  );
  const usingDefaultEndpoint = !process.env.NEXT_PUBLIC_CUSTOMER_CHATBOT_URL;
  const chatReady = Boolean(chatbotUrl);

  if (loading || !isAuthenticated) {
    return null;
  }

  const togglePanel = () => setPanelOpen((value) => !value);

  const handleLaunch = () => {
    if (!chatReady) {
      return;
    }

    window.open(
      chatbotUrl,
      "_blank",
      "noopener,noreferrer,width=420,height=720",
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {panelOpen && (
        <section className="w-[22rem] rounded-3xl bg-white/95 px-5 pb-5 pt-4 text-sm shadow-2xl ring-1 ring-gray-200 backdrop-blur-xl dark:bg-gray-900/95 dark:ring-gray-800">
          <header className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">
                NovaDrive Assist
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                Need a hand, {customer?.firstName ?? "driver"}?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chat with our AI agent for quick answers 24/7.
              </p>
            </div>
            <button
              type="button"
              onClick={togglePanel}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Hide chat launcher"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 6 12 12M6 18 18 6"
                />
              </svg>
            </button>
          </header>

          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            {chatReady ? (
              <>
                <p>
                  Chat with the NovaDrive assistant without leaving the dashboard.
                  {usingDefaultEndpoint && (
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      Using default endpoint {DEFAULT_CHATBOT_URL}
                    </span>
                  )}
                </p>
                <div className="h-80 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-inner dark:border-gray-800 dark:bg-gray-900/60">
                  <iframe
                    src={chatbotUrl}
                    title="NovaDrive Chat Assistant"
                    loading="lazy"
                    className="h-full w-full border-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-blue-600"
                >
                  Pop out chat window
                </button>
              </>
            ) : (
              <p>
                Chat endpoint isn&apos;t configured yet. Set{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                  NEXT_PUBLIC_CUSTOMER_CHATBOT_URL
                </code>{" "}
                to enable the assistant.
              </p>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={togglePanel}
        aria-expanded={panelOpen}
        className="flex items-center gap-3 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-gray-900/30 transition hover:translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:shadow-white/40"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h5m-5 4h8M5 4h14a2 2 0 0 1 2 2v9.586a2 2 0 0 1-.586 1.414l-3.414 3.414A2 2 0 0 1 15.586 21H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            />
          </svg>
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-gray-900 dark:ring-white" />
        </span>
        <div className="text-left leading-tight">
          <p className="text-[11px] uppercase tracking-wide text-white/70 dark:text-gray-600">
            Chatbot
          </p>
          <p>Need help?</p>
        </div>
      </button>
    </div>
  );
}
