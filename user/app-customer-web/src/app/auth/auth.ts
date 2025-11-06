"use client";

import { api } from "./api";

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export type SigninPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string };

export type SigninResponse = Customer;
export type SignupResponse = { message: string; name: string; email: string };

export async function signin(payload: SigninPayload): Promise<SigninResponse> {
  await api.post("/api/login", payload);
  const { data } = await api.get<{ customer: Customer }>("/api/customers/me");
  return data.customer;
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>(
    "/api/signup",
    payload,
  );
  return data;
}
