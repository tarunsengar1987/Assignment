import { apiFetch } from "./api";

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const res = await apiFetch('/me', {
      method: 'GET',
      credentials: 'include',
    });

    return res.ok;
  } catch (error) {
    console.error('[Auth] Authentication check failed:', error);
    return false;
  }
};

export const logout = async () => {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include', // server clears http-only cookies
    });
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};



export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }

  return undefined;
};