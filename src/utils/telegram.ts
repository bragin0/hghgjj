// Telegram Web App API integration
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        LocationManager: {
          init: (callback: (location: { latitude: number; longitude: number }) => void) => void;
          getLocation: (callback: (location: { latitude: number; longitude: number } | null) => void) => void;
        };
        requestLocation: (callback: (location: { latitude: number; longitude: number } | null) => void) => void;
      };
    };
  }
}

export const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
};

export const getTelegramUser = () => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
};

export const requestLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (window.Telegram?.WebApp?.requestLocation) {
      window.Telegram.WebApp.requestLocation((location) => {
        if (location) {
          resolve({ lat: location.latitude, lng: location.longitude });
        } else {
          resolve(null);
        }
      });
    } else {
      // Fallback to browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    }
  });
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateSpeed = (
  distance: number,
  timeMs: number
): number => {
  // Returns speed in km/h
  const timeHours = timeMs / (1000 * 60 * 60);
  const distanceKm = distance / 1000;
  return distanceKm / timeHours;
};