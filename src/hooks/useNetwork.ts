import { useState, useEffect, useCallback } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

/**
 * Custom hook to track network connection status globally.
 * Integrates `@capacitor/network` with fallback to standard web APIs.
 */
export function useNetwork() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    try {
      const status: ConnectionStatus = await Network.getStatus();
      setIsOffline(!status.connected);
      setConnectionType(status.connectionType);
    } catch (err) {
      // Fallback for pure browser environments where native plugin is absent
      setIsOffline(!navigator.onLine);
      setConnectionType(navigator.onLine ? 'wifi/cellular' : 'none');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkStatus();

    let listenerHandle: any = null;

    // Try setting up native listener
    try {
      Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        setIsOffline(!status.connected);
        setConnectionType(status.connectionType);
      }).then((handle) => {
        listenerHandle = handle;
      });
    } catch (err) {
      console.log('Capacitor Network listener fallback to window online/offline listeners.');
    }

    // Window event listeners for web browsers
    const handleOnline = () => {
      setIsOffline(false);
      setConnectionType('online');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setConnectionType('none');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkStatus]);

  return {
    isOffline,
    isOnline: !isOffline,
    connectionType,
    isLoading,
    checkStatus
  };
}
