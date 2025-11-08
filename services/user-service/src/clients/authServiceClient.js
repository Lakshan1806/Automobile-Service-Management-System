import dotenv from "dotenv";

dotenv.config();

const REQUIRED_FETCH_ERROR =
  "Global fetch is not available. Run on Node 18+ or provide a fetch polyfill.";

class AuthServiceClient {
  constructor({ baseUrl, timeoutMs = 5000 } = {}) {
    this.baseUrl = baseUrl?.replace(/\/$/, "");
    this.timeoutMs = timeoutMs;
    if (typeof fetch === "undefined") {
      throw new Error(REQUIRED_FETCH_ERROR);
    }
  }

  async getCustomer(customerId) {
    if (!this.baseUrl || customerId === undefined || customerId === null) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/customers/${customerId}`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Auth service responded with ${response.status} for customer ${customerId}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error("Failed to fetch customer details from auth-service", error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

const defaultClient = new AuthServiceClient({
  baseUrl: process.env.AUTH_SERVICE_URL,
  timeoutMs: Number(process.env.AUTH_SERVICE_TIMEOUT_MS ?? 5000),
});

export default defaultClient;
export { AuthServiceClient };

