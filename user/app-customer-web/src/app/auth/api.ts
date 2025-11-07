import axios from "axios";

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTHENTICATION_SERVICE_API_URL,
  withCredentials: true,
});

const userApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_SERVICE_API_URL,
  withCredentials: true,
});

const locationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LOCATION_SERVICE_API_URL,
  withCredentials: true,
}); 

export { authApi, userApi, locationApi };
