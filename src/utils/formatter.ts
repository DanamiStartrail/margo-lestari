import type { WeatherItem } from '../types/weather.js';
import type { OpenMeteoCurrentData } from '../types/openmeteo.js';
import { decodeWMOCode } from '../services/openmeteo.js';

export interface WeatherSummary {
  status: 'AMAN' | 'WASPADA' | 'SIAGA';
  pesanWhatsApp: string;
}

export function evaluateRainfallLevel(rainBmkg: number, rainOpenMeteo: number): 'AMAN' | 'WASPADA' | 'SIAGA' {
  // Ambil nilai curah hujan tertinggi dari kedua sumber untuk prinsip kewaspadaan
  const maxRain = Math.max(rainBmkg, rainOpenMeteo);

  if (maxRain >= 50) return 'SIAGA';
  if (maxRain >= 20) return 'WASPADA';
  return 'AMAN';
}

export function formatWeatherBroadcast(
  bmkg: WeatherItem | null,
  openMeteo: OpenMeteoCurrentData | null
): WeatherSummary {
  const rainBmkg = bmkg?.tp ?? 0;
  const rainOpenMeteo = openMeteo?.precipitation ?? 0;
  const status = evaluateRainfallLevel(rainBmkg, rainOpenMeteo);

  const waktu = bmkg?.local_datetime ?? new Date().toLocaleString('id-ID');
  const kondisiBmkg = bmkg?.weather_desc ?? 'Tidak tersedia';
  const kondisiOpenMeteo = openMeteo ? decodeWMOCode(openMeteo.weather_code) : 'Tidak tersedia';
  const suhu = bmkg?.t ?? openMeteo?.temperature_2m ?? '-';

  // Deteksi Perbedaan Prediksi
  const isConflict = (rainBmkg < 20 && rainOpenMeteo >= 20) || (rainBmkg >= 20 && rainOpenMeteo < 20);

  const statusHeader =
    status === 'SIAGA'
      ? '🚨 *PERINGATAN DARURAT: HUJAN LEBAT*'
      : status === 'WASPADA'
      ? '⚠️ *PERINGATAN CUACA MARGO LESTARI*'
      : '🌤️ *INFO CUACA MARGO LESTARI*';

  const statusEmoji = status === 'SIAGA' ? '🔴' : status === 'WASPADA' ? '🟡' : '🟢';

  let himbauan = '';
  if (status === 'SIAGA') {
    himbauan = '• Pindahkan barang berharga ke tempat aman.\n• Amankan jalur irigasi & matikan listrik jika air mulai menggenang.';
  } else if (status === 'WASPADA') {
    if (isConflict) {
      himbauan = '• *Catatan:* Terdapat perbedaan prediksi antara BMKG dan Open-Meteo. Petani di sawah diimbau tetap bersiap membawa jas hujan & mengamankan jemuran panen.';
    } else {
      himbauan = '• Petani dan warga yang beraktivitas di luar diimbau membawa jas hujan.\n• Cek saluran air di sekitar rumah.';
    }
  } else {
    himbauan = '• Cuaca sangat kondusif untuk aktivitas di sawah, jemur hasil panen, atau bepergian.';
  }

  const pesan = `${statusHeader}
📅 *Hari/Waktu:* ${waktu} WIB

${statusEmoji} *STATUS: ${status}*

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