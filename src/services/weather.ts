import axios from 'axios';
import { ENV } from '../config/env.js';
import type { BMKGWeatherResponse, WeatherItem } from '../types/weather.js';

export async function getNearestWeatherForecast(): Promise<WeatherItem | null> {
  try {
    const response = await axios.get<BMKGWeatherResponse>(ENV.BMKG.API_URL);
    const dataEntries = response.data.data;

    if (!dataEntries || dataEntries.length === 0 || !dataEntries[0]?.cuaca) {
      return null;
    }

    const allForecasts: WeatherItem[] = dataEntries[0].cuaca.flat();

    if (allForecasts.length === 0 || !allForecasts[0]) {
      return null;
    }

    const now = Date.now();
    let nearestItem: WeatherItem = allForecasts[0];
    let smallestDiff = Math.abs(
      new Date(nearestItem.local_datetime.replace(' ', 'T')).getTime() - now
    );

    for (const item of allForecasts) {
      if (!item?.local_datetime) continue;

      const itemTime = new Date(item.local_datetime.replace(' ', 'T')).getTime();
      const diff = Math.abs(itemTime - now);

      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestItem = item;
      }
    }

    return nearestItem;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Weather Service] Gagal mengambil data API BMKG:', error.message);
    } else {
      console.error('[Weather Service] Terjadi kesalahan tak terduga:', error);
    }
    return null;
  }
}