'use client';

import axios, { AxiosError, type AxiosInstance } from 'axios';

export type Customer = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  customer: Customer;
  accessToken: string;
  expiresIn: number;
};

export type SignupResponse = Customer;

let client: AxiosInstance | null = null;

function getClient() {
  if (!client) {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseURL) {
      throw new Error('API base URL is not configured.');
    }

    client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: false,
    });
  }

  return client;
}

export async function signin(payload: SigninPayload): Promise<AuthResponse> {
  try {
    const { data } = await getClient().post<AuthResponse>('/api/customers/login', payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  try {
    const { data } = await getClient().post<SignupResponse>('/api/customers/signup', payload);
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

function normalizeError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail;
    if (typeof message === 'string' && message.trim().length > 0) {
      return new Error(message);
    }
    if (Array.isArray(error.response?.data?.errors) && error.response?.data?.errors.length > 0) {
      return new Error(String(error.response?.data?.errors[0]));
    }
    if (error.response?.status === 0) {
      return new Error('Unable to reach the server. Check your connection.');
    }
    return new Error(`Request failed with status ${error.response?.status ?? 'unknown'}.`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Something went wrong. Please try again.');
}
