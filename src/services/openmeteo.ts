import axios from 'axios';
import { ENV } from '../config/env.js';
import type {
  OpenMeteoHourlyData,
  OpenMeteoHourlyResponse,
} from '../types/openmeteo.js';
import type { SourceResult } from '../types/weather.js';

export interface RainfallWindow {
  rain1h: number | null;
  rain3h: number | null;
  rain6h: number | null;
}

function sumCompleteWindow(values: number[], size: number): number | null {
  if (values.length < size) return null;
  return values.slice(0, size).reduce((total, value) => total + value, 0);
}

export function aggregateRainfall(hourly: OpenMeteoHourlyData): RainfallWindow {
  return {
    rain1h: sumCompleteWindow(hourly.precipitation, 1),
    rain3h: sumCompleteWindow(hourly.precipitation, 3),
    rain6h: sumCompleteWindow(hourly.precipitation, 6),
  };
}

export async function getOpenMeteoCurrentWeather(): Promise<
  SourceResult<OpenMeteoHourlyResponse>
> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await axios.get<OpenMeteoHourlyResponse>(
      `${ENV.OPEN_METEO.BASE_URL}?latitude=${ENV.OPEN_METEO.LAT}` +
        `&longitude=${ENV.OPEN_METEO.LON}` +
        '&hourly=precipitation,precipitation_probability,temperature_2m,' +
        'relative_humidity_2m,dew_point_2m,cloud_cover,surface_pressure,cape,' +
        'wind_speed_10m,wind_gusts_10m,weather_code&forecast_hours=48' +
        '&timezone=Asia%2FJakarta',
      { timeout: 10_000 },
    );

    if (!response.data.hourly?.time?.length) {
      return {
        source: 'open-meteo',
        status: 'ERROR',
        data: null,
        fetchedAt,
        error: 'Respons Open-Meteo tidak memiliki data hourly',
      };
    }

    return { source: 'open-meteo', status: 'OK', data: response.data, fetchedAt };
  } catch (error) {
    return {
      source: 'open-meteo',
      status: 'ERROR',
      data: null,
      fetchedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function decodeWMOCode(code: number): string {
  switch (code) {
    case 0: return 'Cerah';
    case 1:
    case 2:
    case 3: return 'Cerah Berawan / Berawan Sebagian';
    case 45:
    case 48: return 'Berkabut';
    case 51:
    case 53:
    case 55: return 'Gerimis';
    case 61:
    case 63:
    case 65: return 'Hujan';
    case 80:
    case 81:
    case 82: return 'Hujan Lebat';
    case 95: return 'Hujan Badai / Petir';
    default: return 'Kondisi Berawan';
  }
}
