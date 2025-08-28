import { useState, useEffect, useCallback, useRef } from 'react';
import { useSendbird } from '@sendbird/uikit-react';
import { 
  ensureSendBirdUser, 
  SendBirdConnectionStatus,
  SendBirdApiError 
} from '../integrations/sendbird/user';
import { useAuth } from '../contexts/AuthContext';

export interface UseSendBirdConnectionReturn {
  connectionStatus: SendBirdConnectionStatus;
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useSendBirdConnection(): UseSendBirdConnectionReturn {
  const { user } = useAuth();
  const { state } = useSendbird();
  const { sdkStore, userStore } = state.stores;
  const [connectionStatus, setConnectionStatus] = useState<SendBirdConnectionStatus>({ status: 'disconnected' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionAttempts = useRef(0);
  const maxRetries = 3;

  const connect = useCallback(async () => {
    if (!user || connectionAttempts.current >= maxRetries) {
      return;
    }

    setIsLoading(true);
    setError(null);
    connectionAttempts.current++;

    try {
      // Ensure user exists in SendBird before connecting
      await ensureSendBirdUser(user);
      
      // The connection is managed by SendBird UI Kit
      // We need to wait for both the SDK and user to be ready
      if (sdkStore.sdk && userStore.user) {
        setConnectionStatus({ status: 'connected' });
        connectionAttempts.current = 0; // Reset retry counter on success
      } else {
        setConnectionStatus({ status: 'connecting' });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to prepare SendBird user';
      setError(errorMessage);
      setConnectionStatus({ status: 'error', error: errorMessage });
      console.error('SendBird user preparation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, sdkStore.sdk]);

  const retry = useCallback(async () => {
    if (connectionAttempts.current < maxRetries) {
      await connect();
    }
  }, [connect]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      // Since we're using SendBird UI Kit, the connection is managed by the provider
      setConnectionStatus({ status: 'disconnected' });
      setError(null);
    } catch (err) {
      console.error('Error during SendBird disconnect:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitor SendBird UI Kit connection state
  useEffect(() => {
    if (!user) return;

    // Monitor SDK state changes
    const checkConnectionState = () => {
      console.log('🔍 Hook connection check:', {
        sdkReady: !!sdkStore.sdk,
        userReady: !!userStore.user,
        sdkLoading: sdkStore.loading,
        userLoading: userStore.loading
      });
      
      if (sdkStore.sdk && userStore.user) {
        setConnectionStatus({ status: 'connected' });
        setError(null);
      } else if (sdkStore.loading || userStore.loading) {
        setConnectionStatus({ status: 'connecting' });
      } else {
        setConnectionStatus({ status: 'disconnected' });
      }
    };

    // Check initial state
    checkConnectionState();

    // Set up interval to monitor state changes
    const interval = setInterval(checkConnectionState, 1000);

    // Initial connection attempt
    connect();

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [user, connect, sdkStore.sdk, sdkStore.loading]);

  // Auto-retry on connection failure
  useEffect(() => {
    if (connectionStatus.status === 'error' && connectionAttempts.current < maxRetries) {
      const retryTimer = setTimeout(() => {
        retry();
      }, 2000 * (connectionAttempts.current + 1)); // Exponential backoff

      return () => clearTimeout(retryTimer);
    }
  }, [connectionStatus.status, retry]);

  return {
    connectionStatus,
    isLoading,
    error,
    retry,
    disconnect
  };
}
