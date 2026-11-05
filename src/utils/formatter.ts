import type { WeatherItem, SourceResult } from '../types/weather.js';
import type { OpenMeteoHourlyResponse } from '../types/openmeteo.js';
import { aggregateRainfall, decodeWMOCode } from '../services/openmeteo.js';

export type AlertStatus = 'AMAN' | 'WASPADA' | 'SIAGA' | 'DATA_TIDAK_TERSEDIA';

export interface WeatherSummary {
  status: AlertStatus;
  pesanWhatsApp: string;
}

export function evaluateRainfallLevel(
  rainValues: Array<number | null>,
): AlertStatus {
  const validValues = rainValues.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (validValues.length === 0) return 'DATA_TIDAK_TERSEDIA';

  const maximumRain = Math.max(...validValues);
  if (maximumRain >= 50) return 'SIAGA';
  if (maximumRain >= 20) return 'WASPADA';
  return 'AMAN';
}

export function formatWeatherBroadcast(
  bmkg: SourceResult<WeatherItem>,
  openMeteo: SourceResult<OpenMeteoHourlyResponse>,
): WeatherSummary {
  const bmkgRain = bmkg.data?.tp ?? null;
  const openMeteoWindow = openMeteo.data
    ? aggregateRainfall(openMeteo.data.hourly)
    : null;
  const openMeteoRain = openMeteoWindow?.rain3h ?? null;
  const status = evaluateRainfallLevel([bmkgRain, openMeteoRain]);
  const activeSources = [
    bmkg.data ? 'BMKG' : null,
    openMeteo.data ? 'Open-Meteo' : null,
  ].filter((source): source is string => source !== null);
  const dataNote = activeSources.length === 2
    ? 'Kualitas data: OK'
    : activeSources.length === 1
      ? `Kualitas data: PARTIAL_DATA (sumber aktif: ${activeSources[0]})`
      : 'Kualitas data: DATA_TIDAK_TERSEDIA';

  const firstIndex = openMeteo.data?.hourly.time.length ? 0 : -1;
  const openMeteoCode = firstIndex >= 0
    ? openMeteo.data?.hourly.weather_code[firstIndex]
    : undefined;
  const waktu = bmkg.data?.local_datetime ?? openMeteo.data?.hourly.time[0] ??
    new Date().toLocaleString('id-ID');
  const kondisiBmkg = bmkg.data?.weather_desc ?? 'Tidak tersedia';
  const kondisiOpenMeteo = openMeteoCode !== undefined
    ? decodeWMOCode(openMeteoCode)
    : 'Tidak tersedia';
  const suhu = bmkg.data?.t ?? openMeteo.data?.hourly.temperature_2m[0] ?? '-';
  const isConflict = bmkgRain !== null && openMeteoRain !== null &&
    ((bmkgRain < 20 && openMeteoRain >= 20) ||
      (bmkgRain >= 20 && openMeteoRain < 20));

  const statusHeader = status === 'SIAGA'
    ? '🚨 *PERINGATAN DARURAT: HUJAN LEBAT*'
    : status === 'WASPADA'
      ? '⚠️ *PERINGATAN CUACA MARGO LESTARI*'
      : status === 'DATA_TIDAK_TERSEDIA'
        ? '⛔ *DATA CUACA TIDAK TERSEDIA*'
        : '🌤️ *INFO CUACA MARGO LESTARI*';
  const statusEmoji = status === 'SIAGA' ? '🔴' : status === 'WASPADA' ? '🟡' : status === 'DATA_TIDAK_TERSEDIA' ? '⚪' : '🟢';
  const himbauan = status === 'SIAGA'
    ? '• Pindahkan barang berharga ke tempat aman.\n• Amankan jalur irigasi & matikan listrik jika air mulai menggenang.'
    : status === 'WASPADA'
      ? isConflict
        ? '• Terdapat perbedaan prediksi; warga diimbau tetap bersiap membawa jas hujan.'
        : '• Bawa jas hujan dan cek saluran air di sekitar rumah.'
      : status === 'DATA_TIDAK_TERSEDIA'
        ? '• Jangan menganggap kondisi AMAN. Pantau kondisi fisik dan sumber resmi setempat.'
        : '• Cuaca relatif kondusif untuk aktivitas di sawah atau bepergian.';

  const pesan = `${statusHeader}
📅 *Hari/Waktu:* ${waktu} WIB

${statusEmoji} *STATUS: ${status}*
${dataNote}

Laporan Cuaca:
• BMKG Utama  : ${kondisiBmkg}
• Open-Meteo  : ${kondisiOpenMeteo}
• Suhu Udara  : ${suhu}°C

💡 *Himbauan Warga & Petani:*
${himbauan}

🗺️ *Pantau Radar Hujan Live:*
https://www.rainviewer.com/weather-radar-map-live.html?loc=-5.2933,105.3409,10

_Salam hangat, Pemdes & Tim Relawan Desa Margo Lestari_`;

  return { status, pesanWhatsApp: pesan };
}
