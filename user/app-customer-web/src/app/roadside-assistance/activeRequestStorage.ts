"use client";

type StoredRoadsideRequest = {
  requestId: string;
  reference: string;
  status: string;
  storedAt: string;
};

const ACTIVE_REQUEST_STORAGE_KEY = "novadrive.roadside.active-request";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function saveActiveRequest(request: Omit<StoredRoadsideRequest, "storedAt">) {
  if (!isBrowser()) {
    return;
  }

  const payload: StoredRoadsideRequest = {
    ...request,
    storedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    ACTIVE_REQUEST_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

function readActiveRequest(): StoredRoadsideRequest | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(ACTIVE_REQUEST_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredRoadsideRequest;
    if (
      typeof parsed.requestId === "string" &&
      typeof parsed.reference === "string" &&
      typeof parsed.status === "string"
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse active roadside request cache.", error);
  }

  window.localStorage.removeItem(ACTIVE_REQUEST_STORAGE_KEY);
  return null;
}

function clearActiveRequest() {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(ACTIVE_REQUEST_STORAGE_KEY);
}

export type { StoredRoadsideRequest };
export { saveActiveRequest, readActiveRequest, clearActiveRequest };
