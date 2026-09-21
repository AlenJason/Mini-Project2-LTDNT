import { Geolocation } from '@capacitor/geolocation';
import type { Coordinates } from '../types/survey';

export async function getCurrentCoordinates(): Promise<Coordinates> {
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function mapsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
