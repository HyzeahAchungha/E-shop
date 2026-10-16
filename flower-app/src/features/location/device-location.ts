import * as Location from 'expo-location';

import type { DeviceLocationDeps } from './location-actions';

const POSITION_TIMEOUT_MS = 20_000;

// The real device features behind resolveDeviceLocation. Permission is "while using the app" only.
export const deviceLocation: DeviceLocationDeps = {
  hasServicesEnabled: () => Location.hasServicesEnabledAsync(),
  requestPermission: async () => {
    const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    return { granted, canAskAgain };
  },
  getPosition: async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Reading the position took too long.')), POSITION_TIMEOUT_MS);
    });
    try {
      // Balanced accuracy is plenty: the result is rounded to about 1 km anyway.
      const { coords } = await Promise.race([Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), timeout]);
      return { latitude: coords.latitude, longitude: coords.longitude };
    } finally {
      clearTimeout(timer);
    }
  },
  reverseGeocode: (position) => Location.reverseGeocodeAsync(position),
};
