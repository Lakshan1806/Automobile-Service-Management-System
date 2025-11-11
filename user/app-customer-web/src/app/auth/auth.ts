"use client";

import { authApi,userApi } from "./api";

const VEHICLE_STORAGE_KEY = "novadrive.customer.vehicles";

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export type CustomerVehicle = {
  vehicleId: string;
  noPlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  numberPlate?: string;
  vehicleType?: string | null;
  vehicleModelYear?: number | null;
  vehicleRegistrationYear?: number | null;
  mileage?: number | null;
  lastServiceDate?: string | null;
  chassisNo?: string | null;
};

export type CustomerDetails = {
  id: string;
  name: string | null;
  email: string | null;
  telephoneNumber: string;
  address: string;
};


export type SigninPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string };
export type VerifySignupPayload = { email: string; otp: string };

export type SigninResponse = {
  customer: Customer;
  accessToken: string;
  expiresIn: number;
  realm: string;
  roles: string[];
};
export type SignupResponse = { message: string; name: string; email: string };
export type SignupOtpResponse = { message: string };

export function cacheVehicles(vehicles: CustomerVehicle[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicles));
}

export function clearCachedVehicles(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(VEHICLE_STORAGE_KEY);
}

export function readCachedVehicles(): CustomerVehicle[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(VEHICLE_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as CustomerVehicle[];
  } catch (error) {
    console.warn("Failed to parse cached vehicle list.", error);
    window.localStorage.removeItem(VEHICLE_STORAGE_KEY);
    return [];
  }
}

export async function fetchCustomerVehicles(
  customerId: string,
): Promise<CustomerVehicle[]> {
  if (!customerId) {
    return [];
  }
  const { data } = await userApi.get<CustomerVehicle[]>(
    `/api/customers/${encodeURIComponent(customerId)}/vehicles`,
  );
  return data ?? [];
}

export async function fetchCustomerDetails(
  customerId: string,
): Promise<CustomerDetails | null> {
  if (!customerId) {
    return null;
  }
  const { data } = await userApi.get<{ customer: unknown }>(
    `/api/customer-profiles/${encodeURIComponent(customerId)}/details`,
  );

  if (!data || typeof data !== "object" || !("customer" in data)) {
    return null;
  }
  const payload = (data as { customer: Record<string, unknown> }).customer;
  const idCandidate = payload.id;
  const id =
    typeof idCandidate === "string"
      ? idCandidate
      : typeof idCandidate === "number"
        ? String(idCandidate)
        : "";

  return {
    id,
    name: (payload.name as string | null) ?? null,
    email: (payload.email as string | null) ?? null,
    telephoneNumber:
      typeof payload.telephoneNumber === "string"
        ? payload.telephoneNumber
        : "",
    address:
      typeof payload.address === "string" ? payload.address : "",
  };
}

export async function signin(payload: SigninPayload): Promise<SigninResponse> {
  // The login response is now based SigninResponse
  const { data: authResponse } = await authApi.post<SigninResponse>(
    "/api/customers/login", 
    payload
  );

  // We no longer need the extra /me call, since /login returns everything.
  // const { data } = await authApi.get<{ customer: Customer }>("/api/customers/me");
  // const customer = data.customer;

  try {
    const vehicles = await fetchCustomerVehicles(authResponse.customer.id);
    cacheVehicles(vehicles);
  } catch (error) {
    console.info("Unable to preload vehicles after signin.", error);
    clearCachedVehicles();
  }

  return authResponse; 
}

export async function requestSignupOtp(
  payload: SignupPayload,
): Promise<SignupOtpResponse> {
  const { data } = await authApi.post<SignupOtpResponse>(
    "/api/customers/signup/request-otp",
    payload,
  );
  return data;
}

export async function verifySignupOtp(
  payload: VerifySignupPayload,
): Promise<SignupResponse> {
  const { data } = await authApi.post<SignupResponse>(
    "/api/customers/signup/verify",
    payload,
  );
  return data;
}
