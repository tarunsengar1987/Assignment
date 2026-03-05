import { apiFetch } from '@/lib/api';

// Type guards for validation - more permissive
function isValidCapture(obj: any): obj is Capture {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  // Only log in browser environment to avoid hydration mismatches
  if (typeof window !== 'undefined') {
    console.log('Validating capture:', {
      id: obj.id,
      method: obj.method,
      hasMember: !!obj.member,
      hasWork: !!obj.work,
      hasEmail: !!obj.email,
      state: obj.state,
      capturedAt: obj.capturedAt
    });
  }
  
  // Basic required fields
  const hasBasicFields = (
    typeof obj.id === 'string' &&
    typeof obj.capturedAt === 'string'
  );
  
  if (!hasBasicFields) {
    if (typeof window !== 'undefined') {
      console.warn('Missing basic fields:', { id: obj.id, capturedAt: obj.capturedAt });
    }
    return false;
  }
  
  // Optional method validation - allow unknown methods
  if (obj.method && typeof obj.method !== 'string') {
    if (typeof window !== 'undefined') {
      console.warn('Invalid method:', obj.method);
    }
    return false;
  }
  
  // Optional state validation - allow unknown states
  if (obj.state && typeof obj.state !== 'string') {
    if (typeof window !== 'undefined') {
      console.warn('Invalid state:', obj.state);
    }
    return false;
  }
  
  // Make nested objects optional
  if (obj.member && (typeof obj.member !== 'object' || !obj.member.id)) {
    if (typeof window !== 'undefined') {
      console.warn('Invalid member structure:', obj.member);
    }
    return false;
  }
  
  if (obj.work && (typeof obj.work !== 'object' || !obj.work.id)) {
    if (typeof window !== 'undefined') {
      console.warn('Invalid work structure:', obj.work);
    }
    return false;
  }
  
  if (obj.email && typeof obj.email !== 'object') {
    if (typeof window !== 'undefined') {
      console.warn('Invalid email structure:', obj.email);
    }
    return false;
  }
  
  return true;
}

function validateCaptureResponse(data: any): { isValid: boolean; captures: Capture[]; error?: string } {
  if (!data || typeof data !== 'object') {
    if (typeof window !== 'undefined') {
      console.error('Invalid response format:', data);
    }
    return { isValid: false, captures: [], error: 'Invalid response format' };
  }

  const captures = Array.isArray(data.content) ? data.content : [];
  if (typeof window !== 'undefined') {
    console.log(`Processing ${captures.length} captures from response`);
  }
  
  const validCaptures: Capture[] = [];
  const errors: string[] = [];

  captures.forEach((capture: Capture, index: number) => {
    if (isValidCapture(capture)) {
      validCaptures.push(capture);
    } else {
      errors.push(`Invalid capture at index ${index}`);
    }
  });

  if (typeof window !== 'undefined') {
    console.log(`Validation result: ${validCaptures.length} valid, ${errors.length} invalid`);
  }

  // Be more permissive - if we have some valid captures, consider it a success
  if (errors.length > 0 && typeof window !== 'undefined') {
    console.warn('Capture validation errors:', errors);
  }

  return {
    isValid: validCaptures.length > 0 || captures.length === 0,
    captures: validCaptures,
    error: validCaptures.length === 0 && errors.length > 0 ? `All captures were invalid: ${errors.join(', ')}` : undefined
  };
}

export type Capture = {
  id: string;
  method: 'KEY_IN' | 'SCAN';
  member: {
    id: string;
    name: string;
    profileUrl?: string;
  };
  work: {
    id: string;
    name: string;
  };
  email: {
    address: string;
    domain: {
      name: string;
      type: string;
    };
    type: string;
    username: string;
  };
  personName: string;
  companyName: string;
  contactImageUrl?: string;
  state: 'NONE' | 'RAW' | 'RECOGNIZED' | 'NORMALIZED' | 'LINKED' | 'ENRICHING' | 'FAILED_TO_ENRICH' | 'MERGED' | 'DISCARDED';
  capturedAt: string;
};

export const captureService = {
  async scanCard(orgId: string, imageBlob: Blob, workId?: string) {
    const formData = new FormData();
    if (workId) formData.append('work-Id', workId);
    formData.append('scan-image-file', imageBlob, 'capture.jpg');

    return apiFetch(`/orgs/${orgId}/captures/scan`, {
      method: 'POST',
      body: formData,
    });
  },

  async getCaptures(orgId: string, cursor?: string, size: number = 20) {
    const query = new URLSearchParams({
      size: size.toString(),
      ...(cursor ? { cursor } : {}),
    });
    
    const response = await apiFetch(`/orgs/${orgId}/captures?${query.toString()}`);
    
    // Add validation wrapper
    if (response.ok) {
      const data = await response.json();
      const validation = validateCaptureResponse(data);
      
      if (!validation.isValid && typeof window !== 'undefined') {
        console.error('Invalid capture data received:', validation.error);
        // Return a 400 error for completely invalid data
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For partial success, log but continue with valid captures
      if (validation.error && typeof window !== 'undefined') {
        console.warn('Partial validation success - some captures filtered:', validation.error);
      }
      
      // Return modified response with only valid captures
      const modifiedData = {
        ...data,
        content: validation.captures
      };
      
      return new Response(JSON.stringify(modifiedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return response;
  },

  async getCaptureDetail(orgId: string, captureId: string) {
    const response = await apiFetch(`/orgs/${orgId}/captures/${captureId}`);
    
    // Add validation for single capture
    if (response.ok) {
      const data = await response.json();
      
      if (!isValidCapture(data)) {
        if (typeof window !== 'undefined') {
          console.error('Invalid capture detail data received:', data);
        }
        return new Response(JSON.stringify({ error: 'Invalid capture data format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return the original response with validated data
      // Since we already read the response, we need to create a new one
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return response;
  },

  async markDiscarded(orgId: string, captureId: string) {
    return apiFetch(`/orgs/${orgId}/captures/${captureId}`, {
      method: 'DELETE',
    });
  }
};
