import axios from 'axios';

const DEFAULT_LOCATION_BASE = 'http://localhost:5010';

const locationServiceBaseUrl = (
  process.env.LOCATION_SERVICE_URL ||
  DEFAULT_LOCATION_BASE
).replace(/\/+$/, '');

const defaultHeaders = {};
if (process.env.LOCATION_SERVICE_COOKIE) {
  defaultHeaders.Cookie = process.env.LOCATION_SERVICE_COOKIE;
}

const locationApi = axios.create({
  baseURL: locationServiceBaseUrl,
  withCredentials: true,
  headers: defaultHeaders,
});

export { locationApi, locationServiceBaseUrl };
