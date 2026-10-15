import express from 'express';
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

  await sendWeatherBroadcast(summary);
}

// 1. Jalankan Dummy Server HTTP untuk Render & UptimeRobot
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Margo Lestari Weather Backend',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[HTTP Server] Aktif dan mendengarkan di port ${PORT}`);
});

// 2. Inisialisasi WhatsApp & jalankan pengambilan cuaca pertama setelah terkoneksi
initWhatsAppClient(() => {
  handleWeatherJob();
});

// 3. Jalankan cron job berkala
cron.schedule(ENV.CRON_SCHEDULE, () => {
  handleWeatherJob();
});