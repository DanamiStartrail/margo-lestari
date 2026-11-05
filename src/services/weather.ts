import axios from 'axios';
import { ENV } from '../config/env.js';
import type { BMKGWeatherResponse, SourceResult, WeatherItem } from '../types/weather.js';

export async function getNearestWeatherForecast(): Promise<SourceResult<WeatherItem>> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await axios.get<BMKGWeatherResponse>(ENV.BMKG.API_URL, {
      timeout: 10_000,
    });
    const dataEntries = response.data.data;
    const allForecasts = dataEntries?.[0]?.cuaca?.flat() ?? [];

    if (allForecasts.length === 0) {
      return {
        source: 'bmkg',
        status: 'ERROR',
        data: null,
        fetchedAt,
        error: 'Respons BMKG tidak memiliki data prakiraan',
      };
    }

    const now = Date.now();
    const nearestItem = allForecasts.reduce((nearest, item) => {
      const nearestTime = new Date(nearest.local_datetime.replace(' ', 'T')).getTime();
      const itemTime = new Date(item.local_datetime.replace(' ', 'T')).getTime();
      return Math.abs(itemTime - now) < Math.abs(nearestTime - now) ? item : nearest;
    });

    return { source: 'bmkg', status: 'OK', data: nearestItem, fetchedAt };
  } catch (error) {
    return {
      source: 'bmkg',
      status: 'ERROR',
      data: null,
      fetchedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
