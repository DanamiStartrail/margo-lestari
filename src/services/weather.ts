import { CONFIG } from './config/env';

console.log(`Menjalankan sistem untuk ${[link mencurigakan dihapus]}`);
console.log(`Koordinat: ${CONFIG.village.latitude}, ${CONFIG.village.longitude}`);

import axios from 'axios';
import { CONFIG } from '../config/env';
import { WeatherData } from '../types/weather';

export async function getOpenMeteoData(): Promise<WeatherData> {
  try {
    const { latitude, longitude } = CONFIG.village;
    // URL API Open-Meteo presisi Desa Margo Lestari
    const url = `[suspicious link removed]{latitude}&longitude=${longitude}&daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FJakarta`;

    const response = await axios.get(url);
    const daily = [link mencurigakan dihapus].daily;

    const hujanMm = daily.precipitation_sum[0] || 0;
    const suhu = daily.temperature_2m_max[0] || 30;

    // Logika ambang batas curah hujan sederhan
    let kondisi = 'Cerah / Berawan';
    if (hujanMm >= 20) {
      kondisi = 'Hujan Lebat / Potensi Genangan';
    } else if (hujanMm > 5) {
      kondisi = 'Hujan Ringan - Sedang';
    }

    return {
      suhu,
      hujanMm,
      kondisi,
      sumber: 'Open-Meteo API',
    };
  } catch (error) {
    console.error('❌ Gagal mengambil data Open-Meteo:', error);
    return {
      suhu: 30,
      hujanMm: 0,
      kondisi: 'Data Tidak Tersedia',
      sumber: 'Open-Meteo API (Fallback)',
    };
  }
}