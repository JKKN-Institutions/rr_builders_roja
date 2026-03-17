'use client';

import { useEffect, useCallback, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function ServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false,
    registration: null,
  });

  // Handle service worker update
  const handleUpdate = useCallback((registration: ServiceWorkerRegistration) => {
    const newWorker = registration.waiting;
    if (newWorker) {
      // Notify user about update (could be enhanced with a toast)
      console.log('[App] New version available. Refresh to update.');
      setState(prev => ({ ...prev, updateAvailable: true }));

      // Optionally auto-update (skip waiting)
      // newWorker.postMessage('skipWaiting');
    }
  }, []);

  // Skip waiting and reload
  const applyUpdate = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage('skipWaiting');
    }
  }, [state.registration]);

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[App] Service workers not supported');
      return;
    }

    setState(prev => ({ ...prev, isSupported: true, isOnline: navigator.onLine }));

    // Track online/offline status
    const handleOnline = () => {
      console.log('[App] Connection restored');
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('[App] Connection lost');
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker after page load
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check for updates
        });

        console.log('[App] Service Worker registered:', registration.scope);
        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] Service Worker update found');

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available
                  console.log('[App] New content available');
                  handleUpdate(registration);
                } else {
                  // First install - content cached
                  console.log('[App] Content cached for offline use');
                }
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          handleUpdate(registration);
        }

        // Check for updates periodically (every 60 seconds)
        const checkForUpdates = () => {
          registration.update().catch(err => {
            console.log('[App] Update check failed:', err);
          });
        };

        const updateInterval = setInterval(checkForUpdates, 60 * 1000);

        // Clean up interval on unmount
        return () => clearInterval(updateInterval);

      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    };

    // Wait for page load before registering
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    // Handle controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] Service Worker controller changed, reloading...');
      // Reload the page to get new content
      window.location.reload();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', registerServiceWorker);
    };
  }, [handleUpdate]);

  // Render update notification if available
  if (state.updateAvailable) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e3a5f',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
        }}
      >
        <span>A new version is available</span>
        <button
          onClick={applyUpdate}
          style={{
            background: '#f59e0b',
            color: '#0f172a',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Update Now
        </button>
      </div>
    );
  }

  return null;
}

// Export utility functions for use elsewhere in the app
export const serviceWorkerUtils = {
  // Check if service worker is registered
  isRegistered: async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length > 0;
  },

  // Force check for updates
  checkForUpdates: async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  },

  // Clear all caches
  clearCache: async (): Promise<void> => {
    if (!('caches' in window)) return;
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('buildwise-'))
        .map(name => caches.delete(name))
    );
  },

  // Unregister all service workers
  unregister: async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  },

  // Get cache storage estimate
  getStorageEstimate: async (): Promise<{ usage: number; quota: number } | null> => {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  },
};
