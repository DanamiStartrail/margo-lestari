import express from 'express';
import cron from 'node-cron';
import { ENV } from './config/env.js';
import { getNearestWeatherForecast } from './services/weather.js';
import { getOpenMeteoCurrentWeather } from './services/openmeteo.js';
import type { OpenMeteoCurrentData } from './types/openmeteo.js';
import { formatWeatherBroadcast } from './utils/formatter.js';
import { writeSystemLog, saveWeatherHistory } from './utils/logger.js';
import {
  getWhatsAppHealth,
  initWhatsAppClient,
  pingWhatsAppMongo,
  sendWeatherBroadcast,
} from './services/whatsapp.js';

let weatherJobRunning = false;
async function handleWeatherJob(): Promise<void> {
  if (weatherJobRunning) {
    writeSystemLog('WARN', 'Job cuaca dilewati karena job sebelumnya masih berjalan.');
    return;
  }
  weatherJobRunning = true;
  writeSystemLog('INFO', 'Memulai penarikan data cuaca...');
  console.log(`\n[${new Date().toISOString()}] Mengambil data cuaca...`);

  try {
    const [bmkgData, openMeteoData] = await Promise.all([
      getNearestWeatherForecast(),
      getOpenMeteoCurrentWeather(),
    ]);
    if (!bmkgData.data && !openMeteoData.data) {
      writeSystemLog('ERROR', 'Gagal mengakses data BMKG dan Open-Meteo.');
    }
    const summary = formatWeatherBroadcast(bmkgData, openMeteoData);
    const openMeteoCurrent: OpenMeteoCurrentData | null = openMeteoData.data
      ? {
          time: openMeteoData.data.hourly.time[0] ?? new Date().toISOString(),
          interval: 3600,
          temperature_2m: openMeteoData.data.hourly.temperature_2m[0] ?? 0,
          relative_humidity_2m: openMeteoData.data.hourly.relative_humidity_2m[0] ?? 0,
          precipitation: openMeteoData.data.hourly.precipitation[0] ?? 0,
          weather_code: openMeteoData.data.hourly.weather_code[0] ?? 0,
          wind_speed_10m: openMeteoData.data.hourly.wind_speed_10m[0] ?? 0,
        }
      : null;
    saveWeatherHistory(bmkgData.data, openMeteoCurrent, summary);
    await sendWeatherBroadcast(summary);
  } finally {
    weatherJobRunning = false;
  }
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

  app.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  });

  app.get('/health/ready', async (_req, res) => {
    const whatsapp = getWhatsAppHealth();
    const mongo = await pingWhatsAppMongo();
    const ready = whatsapp.connected && mongo;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not-ready',
      whatsapp: whatsapp.connected ? 'connected' : 'disconnected',
      mongo: mongo ? 'connected' : 'disconnected',
    });
  });
});

app.listen(PORT, () => {
  console.log(`[HTTP Server] Aktif dan mendengarkan di port ${PORT}`);
});

// 2. Inisialisasi WhatsApp & jalankan pengambilan cuaca pertama setelah terkoneksi
initWhatsAppClient(() => {
  void handleWeatherJob();
});

// 3. Jalankan cron job berkala
cron.schedule(ENV.CRON_SCHEDULE, () => {
  void handleWeatherJob();
});