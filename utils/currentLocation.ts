import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface CurrentAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface ResolvedAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const clean = (value?: string | null) => (value ? value.trim() : '');

const isComplete = (address: ResolvedAddress | null): boolean =>
  !!address &&
  !!address.street &&
  !!address.city &&
  !!address.state &&
  !!address.zipCode;

const reverseGeocodeNative = async (
  latitude: number,
  longitude: number
): Promise<ResolvedAddress | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const result = results[0];

    if (!result) return null;

    return {
      street: clean(
        [result.streetNumber, result.street || result.name].filter(Boolean).join(' ')
      ),
      city: clean(result.city || result.subregion || result.district),
      state: clean(result.region || result.subregion),
      zipCode: clean(result.postalCode),
      country: clean(result.country),
    };
  } catch {
    return null;
  }
};

// expo-location does not reverse geocode on web, so the browser build uses a
// keyless client-side lookup. Native builds use the platform geocoder above.
const reverseGeocodeWeb = async (
  latitude: number,
  longitude: number
): Promise<ResolvedAddress> => {
  let response: Response;

  try {
    response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
  } catch {
    throw new Error(
      'Could not look up your address. Check your connection or add it manually.'
    );
  }

  if (!response.ok) {
    throw new Error('Could not look up your address. Please add it manually.');
  }

  const data = await response.json().catch(() => null);

  if (!data) {
    throw new Error('Could not look up your address. Please add it manually.');
  }

  return {
    street: clean(data.locality || data.city || data.principalSubdivision),
    city: clean(data.city || data.locality || data.principalSubdivision),
    state: clean(data.principalSubdivision),
    zipCode: clean(data.postcode || data.postalCode),
    country: clean(data.countryName),
  };
};

export async function resolveCurrentAddress(): Promise<CurrentAddress> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error(
      permission.canAskAgain
        ? 'Location permission is required to use your current location.'
        : 'Location permission is blocked. Enable it in your device settings or add an address manually.'
    );
  }

  let position: Location.LocationObject;

  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    throw new Error(
      'We could not determine your current location. Try again or add an address manually.'
    );
  }

  const { latitude, longitude } = position.coords;
  const nativeAddress =
    Platform.OS === 'web'
      ? null
      : await reverseGeocodeNative(latitude, longitude);

  let resolved: ResolvedAddress | null = nativeAddress;

  // The platform geocoder can return a partial address (usually a missing
  // postal code). Fall back to the web lookup and fill the gaps.
  if (!isComplete(resolved)) {
    try {
      const webAddress = await reverseGeocodeWeb(latitude, longitude);

      resolved = {
        street: resolved?.street || webAddress.street,
        city: resolved?.city || webAddress.city,
        state: resolved?.state || webAddress.state,
        zipCode: resolved?.zipCode || webAddress.zipCode,
        country: resolved?.country || webAddress.country,
      };
    } catch (lookupError) {
      if (!resolved) throw lookupError;
    }
  }

  const street = resolved?.street || resolved?.city || '';
  const city = resolved?.city || resolved?.state || '';
  const state = resolved?.state || resolved?.city || '';
  const country = resolved?.country || 'India';

  if (!resolved || !street || !city || !state || !resolved.zipCode) {
    throw new Error(
      'We found your location but could not resolve a complete address. Please add it manually.'
    );
  }

  return {
    street,
    city,
    state,
    zipCode: resolved.zipCode,
    country,
    latitude,
    longitude,
  };
}
