import { apiFetch } from '@/lib/api';
import { getCookie } from '@/lib/auth';

export const authService = {
  // 1. Sign Up with Email
  async signup(payload: { email: string; name: string; agreedTermsIds: string[] }) {
    return apiFetch('/auth/members', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        purpose: 'SIGN_UP',
        target: 'MEMBER',
        channel: 'WEB',
        device: 'DESKTOP',
        captchaToken: 'dummy-captcha',
      }),
    });
  },

  // 2. Sign In with Email
  async signin(email: string) {
    return apiFetch('/auth/members', {
      method: 'POST',
      body: JSON.stringify({
        email,
        purpose: 'SIGN_IN',
        target: 'MEMBER',
        channel: 'WEB',
        device: 'DESKTOP',
        captchaToken: 'dummy-captcha',
      }),
    });
  },

  // 3. Verify OTP (Works for both Sign In and Sign Up)
  verifyOtp({ key, otp, purpose }: { key: string; otp: string; purpose: 'SIGN_UP' | 'SIGN_IN' }) {
    return apiFetch('/auth/members', {
      method: 'PUT',
      body: JSON.stringify({
        key,
        secret: otp,
        purpose,
        target: 'MEMBER',
        channel: 'WEB',
        device: 'DESKTOP',
        captchaToken: 'dummy-captcha',
        agreedTermsIds: ['67da79878e3c6d17540d5bbd'],
      }),
    });
  },

  // 4. Refresh Access Token
  async refreshToken() {
    const csrfToken: string | undefined = getCookie("dev.authorization");
    return apiFetch('/auth/reissue-tokens', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-REALIZER-CSRF": csrfToken ?? ""
      },
    },);
  },

  // 5. Sign Out (per OpenAPI: DELETE /me/sign-out)
  async signout() {
    return apiFetch('/me/sign-out', {
      method: 'DELETE',
    });
  },

  // Helper to start any auth (abstracted)
  startEmailAuth({ email, purpose }: { email: string; purpose: 'SIGN_UP' | 'SIGN_IN', }) {
    if (purpose === 'SIGN_UP') {
      return this.signup({ email, name: 'User', agreedTermsIds: ['1'] });
    }
    return this.signin(email);
  },
};