import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { Capture } from '@/services/capture.service';

interface UseCaptureSSEProps {
  orgId: string | null;
  onNewCapture: (capture: Capture) => void;
  onUpdateCapture: (capture: Capture) => void;
}

export function useCaptureSSE({ orgId, onNewCapture, onUpdateCapture }: UseCaptureSSEProps) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!orgId) return;

    console.log(`[SSE] Initializing connection for org: ${orgId}`);
    
    const url = `${API_BASE_URL}/orgs/${orgId}/broadcast`;
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE] Connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Message received:', data.type);
        
        if (data.type === 'NEW_CAPTURE' || data.type === 'CAPTURE') {
          onNewCapture(data.payload);
        } else if (data.type === 'CAPTURE_UPDATED') {
          onUpdateCapture(data.payload);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      setIsConnected(false);
      // EventSource automatically retries, but we might want to log it
      if (eventSource.readyState === 2) { // 2 is CLOSED
        console.log('[SSE] Connection closed by server or network');
      }
    };

    const cleanup = () => {
      if (eventSourceRef.current) {
        console.log('[SSE] Closing connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };

    // Handle application close/refresh explicitly
    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [orgId, onNewCapture, onUpdateCapture]);

  return {
    isConnected
  };
}
