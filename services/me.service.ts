import { apiFetch } from '@/lib/api';

export type MeDetail = {
  id: string;
  target: string;
  myEngagingWork: {
    id: string;
    name: string;
    engaging: boolean;
  };
  member: {
    id: string;
    name: string;
    profileDetail: {
      id: string;
      name: string;
    };
    familyName: string;
    email: string;
    orgMemberRoleType: string;
    orgAdminRoleType: string;
    state: string;
    alias: string;
    org: {
      id: string;
      name: string;
      profileDetail: {
        id: string;
        name: string;
      };
      accessPoint: {
        domain: {
          address: string;
          service: string;
        };
        alias: string;
        uri: string;
      };
      brand: {
        accentColor: string;
        backgroundColor: string;
        fontColor: string;
        headingFontFace: string;
        bodyFontFace: string;
      };
      web: {
        address: string;
        service: string;
      };
    };
    routeKey: string;
  };
};

export const meService = {
  async getMyInfo(): Promise<MeDetail> {
    const res = await apiFetch('/me');
    if (!res.ok) {
      throw new Error(`Failed to fetch user info: ${res.status} ${res.statusText}`);
    }
    
    // Check if response has content before parsing JSON
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  }
};
