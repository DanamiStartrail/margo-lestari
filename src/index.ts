import cron from 'node-cron';
import { ENV } from './config/env.js';
import { getNearestWeatherForecast } from './services/weather.js';
import { getOpenMeteoCurrentWeather } from './services/openmeteo.js';
import { formatWeatherBroadcast } from './utils/formatter.js';
import { writeSystemLog, saveWeatherHistory } from './utils/logger.js';
import { initWhatsAppClient, sendWeatherBroadcast } from './services/whatsapp.js';

async function handleWeatherJob(): Promise<void> {
  writeSystemLog('INFO', 'Memulai penarikan data cuaca...');
  console.log(`\n[${new Date().toISOString()}] Mengambil data cuaca...`);

  const [bmkgData, openMeteoData] = await Promise.all([
    getNearestWeatherForecast(),
    getOpenMeteoCurrentWeather(),
  ]);

  if (!bmkgData && !openMeteoData) {
    writeSystemLog('ERROR', 'Gagal mengakses data BMKG dan Open-Meteo.');
    return;
  }

  const summary = formatWeatherBroadcast(bmkgData, openMeteoData);
  saveWeatherHistory(bmkgData, openMeteoData, summary);

  // Kirim pesan nyata ke WhatsApp
  await sendWeatherBroadcast(summary);
}

// Inisialisasi koneksi WhatsApp saat aplikasi dinyalakan
initWhatsAppClient();

// Jalankan cron job
cron.schedule(ENV.CRON_SCHEDULE, () => {
  handleWeatherJob();
});

console.log('Sistem backend Margo Lestari aktif.');

// Beri jeda 8 detik agar soket WhatsApp sempat terhubung sebelum pengujian pertama
setTimeout(() => {
  handleWeatherJob();
}, 8000);