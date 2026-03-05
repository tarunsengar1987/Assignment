export const isAuthenticated = () => {
  return !!getCookie('accessTokendev');
};


export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);


  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }

  return undefined;
}

export const logout = () => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.clear();
    } catch {}
    try {
      window.sessionStorage?.clear();
    } catch {}
  }

  if (typeof document !== 'undefined') {
    const cookieNames = document.cookie
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => c.split('=')[0])
      .filter(Boolean);

    const namesToClear = new Set<string>([
      ...cookieNames,
      'accessToken',
      'refreshToken',
      'accessTokendev',
    ]);

    for (const name of namesToClear) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }
};

export const updateSessionFromIssuance = (data: { accessToken: string; refreshToken: string }, refreshAfterUpdate: boolean = false) => {
  console.log('[Auth] Updating session from issuance data:', {
    hasAccessToken: !!data?.accessToken,
    hasRefreshToken: !!data?.refreshToken,
    refreshAfterUpdate
  });
  if (data?.accessToken) {
    document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
  }
  if (data?.refreshToken) {
    document.cookie = `refreshToken=${data.refreshToken}; path=/; SameSite=Lax`;
  }
  
  // Refresh the page after successful token reissue
  if (refreshAfterUpdate && typeof window !== 'undefined') {
    console.log('[Auth] Refreshing page after token reissue');
    window.location.reload();
  }
};