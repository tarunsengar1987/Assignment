import { API_BASE_URL } from './config';
import { authService } from '@/services/auth.service';
import { getCookie, logout } from './auth';

// Module-level promise for token refresh to handle concurrent 401s
let refreshPromise: Promise<Response> | null = null;

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const csrfToken: string | undefined = getCookie("dev.authorization") as string | undefined;
  const method = (options.method || 'GET').toUpperCase();

  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(!isFormData && { 'Content-Type': 'application/json' }),

  };

    if (method !== 'GET' && method !== 'OPTIONS' ) {
    headers["X-REALIZER-CSRF"] = csrfToken ?? "";
  }
  if (headers['Content-Type'] === 'undefined') {
    delete headers['Content-Type'];
  }

  const res = await fetch(fullUrl, {
    ...options,
    body: options.body,
    credentials: 'include', // for cookies
    headers,
  });

  // Handle 401 Unauthorized for token refresh
 if (res.status === 401 && !url.includes('/auth/reissue-tokens')) {
  if (!refreshPromise) {
    refreshPromise = authService
      .refreshToken()
      .then((refreshRes) => {
        return refreshRes;
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  try {
    const refreshRes = await refreshPromise;

    if (refreshRes.ok) {
      // retry original request after refresh
      return apiFetch(url, options);
    } else {
      logout();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth/")
      ) {
        window.location.href = "/auth/signin";
      }
    }
  } catch (err) {
    logout();

    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth/")
    ) {
      window.location.href = "/auth/signin";
    }
  }
}

  return res;
}