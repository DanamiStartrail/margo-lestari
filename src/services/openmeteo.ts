import axios from 'axios';
import { ENV } from '../config/env.js';
import type { OpenMeteoResponse, OpenMeteoCurrentData } from '../types/openmeteo.js';

export async function getOpenMeteoCurrentWeather(): Promise<OpenMeteoCurrentData | null> {
  try {
    const response = await axios.get<OpenMeteoResponse>(ENV.OPEN_METEO.API_URL);
    return response.data.current;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[Open-Meteo Service] Gagal mengambil data:', error.message);
    } else {
      console.error('[Open-Meteo Service] Terjadi kesalahan tak terduga:', error);
    }
    return null;
  }
}

export function decodeWMOCode(code: number): string {
  switch (code) {
    case 0:
      return 'Cerah';
    case 1:
    case 2:
    case 3:
      return 'Cerah Berawan / Berawan Sebagian';
    case 45:
    case 48:
      return 'Berkabut';
    case 51:
    case 53:
    case 55:
      return 'Gerimis';
    case 61:
    case 63:
    case 65:
      return 'Hujan';
    case 80:
    case 81:
    case 82:
      return 'Hujan Lebat';
    case 95:
      return 'Hujan Badai / Petir';
    default:
      return 'Kondisi Berawan';
  }
}