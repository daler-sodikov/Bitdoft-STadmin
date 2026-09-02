import axios from "axios";

// Set VITE_API_URL in .env.local to run against a backend you started
// yourself (http://localhost:3000/api); otherwise the deployed one is used.
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://studentappbackend-1.onrender.com/api";

/**
 * Two APIs behind one client.
 *
 * The offline routes (students, groups, homework, news, resources) trust the
 * self-asserted `is-admin: true` header. The academy module (courses, lessons,
 * access grants, academy accounts) rejects that header and requires a signed
 * bearer token from POST /academy/auth/login.
 *
 * The panel's login screen is a browser-side email check that cannot produce
 * such a token, so the token is fetched here instead — on the first academy
 * request, and again whenever one comes back 401. Nothing in the login screen
 * or AuthContext needs to know.
 */
const ACCESS_TOKEN_KEY = "academy_access_token";
const REFRESH_TOKEN_KEY = "academy_refresh_token";

// Kept out of the repo: set both in .env.local (which is gitignored). Without
// them the offline pages still work and the academy pages answer 401.
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    'is-admin': true,
  },
});

const isAcademyRoute = (url = "") => url.includes("/academy/");
const isAcademyAuthRoute = (url = "") => url.includes("/academy/auth/");

// One shared in-flight login, so several academy calls firing at once don't
// each open their own session.
let loginPromise = null;

function academyLogin() {
  if (!ADMIN_PHONE || !ADMIN_PASSWORD) {
    return Promise.reject(
      new Error('VITE_ADMIN_PHONE / VITE_ADMIN_PASSWORD are not set in .env.local'),
    );
  }
  if (!loginPromise) {
    loginPromise = axios
      .post(`${BASE_URL}/academy/auth/login`, {
        phone: ADMIN_PHONE,
        password: ADMIN_PASSWORD,
      })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data;
        tokenStorage.setTokens(accessToken, refreshToken);
        return accessToken;
      })
      .catch((err) => {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message;
        console.warn(`[admin] academy login failed — academy pages will not load: ${message}`);
        throw err;
      })
      .finally(() => {
        loginPromise = null;
      });
  }
  return loginPromise;
}

api.interceptors.request.use(
  async (config) => {
    if (isAcademyRoute(config.url) && !isAcademyAuthRoute(config.url)) {
      let token = tokenStorage.getAccessToken();
      if (!token) {
        try {
          token = await academyLogin();
        } catch {
          // Let the request go out and fail with the server's own answer.
        }
      }
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.isDeleted === true) {
      localStorage.clear();
      alert('Аккаунт удален. Обратитесь к администратору.');
      window.location.reload();
      return Promise.reject(new Error('Account deleted'));
    }
    return response;
  },
  async (error) => {
    // Errors come back as `{ success: false, error: { message } }` from the
    // API, and as a flat `{ message }` from the older offline routes. Screens
    // read `data.message`, so the nested shape is copied up — otherwise the
    // real reason is replaced by each caller's generic fallback.
    const nested = error.response?.data?.error?.message;
    if (nested && !error.response.data.message) {
      error.response.data.message = nested;
    }

    if (
      error.response?.data?.isDeleted === true ||
      error.response?.data?.message === 'Student not found'
    ) {
      localStorage.clear();
      alert('Аккаунт удален. Обратитесь к администратору.');
      window.location.reload();
      return Promise.reject(error);
    }

    // An expired academy token: log in again once and replay the request.
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      isAcademyRoute(original.url) &&
      !isAcademyAuthRoute(original.url) &&
      !original._retried
    ) {
      original._retried = true;
      tokenStorage.clear();
      try {
        const token = await academyLogin();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
