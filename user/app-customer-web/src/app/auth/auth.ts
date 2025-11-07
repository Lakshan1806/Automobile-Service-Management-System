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
};

export type SigninPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string };

export type SigninResponse = Customer;
export type SignupResponse = { message: string; name: string; email: string };

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

export async function signin(payload: SigninPayload): Promise<SigninResponse> {
  await authApi.post("/api/customers/login", payload);
  const { data } = await authApi.get<{ customer: Customer }>("/api/customers/me");
  const customer = data.customer;

  try {
    const vehicles = await fetchCustomerVehicles(customer.id);
    cacheVehicles(vehicles);
  } catch (error) {
    console.info("Unable to preload vehicles after signin.", error);
    clearCachedVehicles();
  }

  return customer;
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const { data } = await authApi.post<SignupResponse>(
    "/api/customers/signup",
    payload,
  );
  return data;
}
