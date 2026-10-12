import cron from 'node-cron';
import { ENV } from './config/env.js';
import { getNearestWeatherForecast } from './services/weather.js';
import { getOpenMeteoCurrentWeather } from './services/openmeteo.js';
import { formatWeatherBroadcast } from './utils/formatter.js';
import { writeSystemLog, saveWeatherHistory } from './utils/logger.js';
import { sendWeatherBroadcast } from './services/whatsapp.js';

async function handleWeatherJob(): Promise<void> {
  writeSystemLog('INFO', 'Memulai penarikan data cuaca dari BMKG dan Open-Meteo...');
  console.log(`[${new Date().toISOString()}] Mengambil data cuaca...`);

  const [bmkgData, openMeteoData] = await Promise.all([
    getNearestWeatherForecast(),
    getOpenMeteoCurrentWeather(),
  ]);

  if (!bmkgData && !openMeteoData) {
    writeSystemLog('ERROR', 'Gagal mengakses seluruh sumber data cuaca.');
    console.error('[Error] Kedua sumber data cuaca gagal diakses.');
    return;
  }

  // 1. Olah data & format pesan
  const summary = formatWeatherBroadcast(bmkgData, openMeteoData);

  // 2. Simpan ke file log riwayat
  saveWeatherHistory(bmkgData, openMeteoData, summary);

  // 3. Teruskan ke layanan WhatsApp Broadcast
  await sendWeatherBroadcast(summary);
}

cron.schedule(ENV.CRON_SCHEDULE, () => {
  handleWeatherJob();
});

writeSystemLog('INFO', 'Layanan backend Margo Lestari berhasil diinisialisasi.');
console.log('Sistem backend Margo Lestari aktif.');
handleWeatherJob();