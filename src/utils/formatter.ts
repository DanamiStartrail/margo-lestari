import type { WeatherItem } from '../types/weather.js';
import type { OpenMeteoCurrentData } from '../types/openmeteo.js';
import { decodeWMOCode } from '../services/openmeteo.js';

export interface WeatherSummary {
  status: 'AMAN' | 'WASPADA' | 'SIAGA';
  pesanWhatsApp: string;
}

/**
 * Menentukan tingkat peringatan berdasarkan curah hujan (mm)
 * Standar BMKG:
 * - 0.5 - 20 mm/hari  : Hujan Ringan
 * - 20 - 50 mm/hari   : Hujan Sedang (Waspada)
 * - > 50 mm/hari      : Hujan Lebat/Sangat Lebat (Siaga)
 */
export function evaluateRainfallLevel(rainBmkg: number, rainOpenMeteo: number): 'AMAN' | 'WASPADA' | 'SIAGA' {
  const maxRain = Math.max(rainBmkg, rainOpenMeteo);

  if (maxRain >= 20 && maxRain < 50) {
    return 'WASPADA';
  }
  if (maxRain >= 50) {
    return 'SIAGA';
  }
  return 'AMAN';
}

/**
 * Menyusun format pesan siaran untuk WhatsApp Channel Desa Margo Lestari
 */
export function formatWeatherBroadcast(
  bmkg: WeatherItem | null,
  openMeteo: OpenMeteoCurrentData | null
): WeatherSummary {
  const rainBmkg = bmkg?.tp ?? 0;
  const rainOpenMeteo = openMeteo?.precipitation ?? 0;
  const status = evaluateRainfallLevel(rainBmkg, rainOpenMeteo);

  const statusHeader =
    status === 'SIAGA'
      ? '🚨 *PERINGATAN DINI: POTENSI HUJAN LEBAT*'
      : status === 'WASPADA'
      ? '⚠️ *WASPADA: POTENSI HUJAN SEDANG*'
      : '🌤️ *PRAKIRAAN CUACA DESA MARGO LESTARI*';

  const waktu = bmkg?.local_datetime ?? new Date().toLocaleString('id-ID');
  const kondisiBmkg = bmkg?.weather_desc ?? 'Tidak tersedia';
  const kondisiOpenMeteo = openMeteo ? decodeWMOCode(openMeteo.weather_code) : 'Tidak tersedia';
  const suhu = bmkg?.t ?? openMeteo?.temperature_2m ?? '-';
  const kelembapan = bmkg?.hu ?? openMeteo?.relative_humidity_2m ?? '-';
  const angin = bmkg?.ws ?? openMeteo?.wind_speed_10m ?? '-';

  const pesan = `${statusHeader}

📅 *Waktu Pembaruan:* ${waktu} WIB
📍 *Wilayah:* Desa Margo Lestari, Jati Agung

📊 *Kondisi Cuaca:*
• Status Prediksi : ${kondisiBmkg} (Pembanding: ${kondisiOpenMeteo})
• Suhu Udara     : ${suhu}°C
• Kelembapan     : ${kelembapan}%
• Curah Hujan    : ${rainBmkg} mm
• Kecepatan Angin: ${angin} km/jam

ℹ️ *Catatan Warga:*
${
  status === 'SIAGA'
    ? 'Diimbau bagi warga di area dataran rendah dan bantaran saluran air untuk mengantisipasi potensi genangan atau luapan air.'
    : status === 'WASPADA'
    ? 'Kondisi berpotensi hujan. Petani dan warga yang beraktivitas di luar ruangan disarankan mempersiapkan perlengkapan hujan.'
    : 'Kondisi cuaca terpantau kondusif untuk aktivitas pertanian dan kegiatan sehari-hari.'
}

_Sumber: BMKG & Open-Meteo API_`;

  return {
    status,
    pesanWhatsApp: pesan,
  };
}