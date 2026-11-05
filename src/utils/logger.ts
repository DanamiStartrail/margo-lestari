import fs from 'node:fs';
import path from 'node:path';
import type { WeatherItem } from '../types/weather.js';
import type { OpenMeteoCurrentData } from '../types/openmeteo.js';
import type { WeatherSummary } from './formatter.js';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

// Pastikan folder logs/ selalu tersedia
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const SYSTEM_LOG_FILE = path.join(LOGS_DIR, 'system.log');
const HISTORY_LOG_FILE = path.join(LOGS_DIR, 'weather_history.jsonl');

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * Mencatat log aktivitas umum ke file system.log
 */
export function writeSystemLog(level: LogLevel, message: string): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;

  try {
    fs.appendFileSync(SYSTEM_LOG_FILE, logLine, 'utf8');
  } catch (error) {
    console.error('[Logger] Gagal menulis system log:', error);
  }
}

export interface WeatherLogRecord {
  timestamp: string;
  waktuPrediksi: string;
  status: 'AMAN' | 'WASPADA' | 'SIAGA' | 'DATA_TIDAK_TERSEDIA';
  bmkg: {
    suhu: number | null;
    kelembapan: number | null;
    curahHujan: number | null;
    kondisi: string;
    kecepatanAngin: number | null;
  } | null;
  openMeteo: {
    suhu: number | null;
    kelembapan: number | null;
    curahHujan: number | null;
    kodeCuaca: number | null;
    kecepatanAngin: number | null;
  } | null;
}

/**
 * Menyimpan riwayat data cuaca terstruktur ke weather_history.jsonl
 */
export function saveWeatherHistory(
  bmkg: WeatherItem | null,
  openMeteo: OpenMeteoCurrentData | null,
  summary: WeatherSummary
): void {
  const record: WeatherLogRecord = {
    timestamp: new Date().toISOString(),
    waktuPrediksi: bmkg?.local_datetime ?? new Date().toLocaleString('id-ID'),
    status: summary.status,
    bmkg: bmkg
      ? {
          suhu: bmkg.t,
          kelembapan: bmkg.hu,
          curahHujan: bmkg.tp,
          kondisi: bmkg.weather_desc,
          kecepatanAngin: bmkg.ws,
        }
      : null,
    openMeteo: openMeteo
      ? {
          suhu: openMeteo.temperature_2m,
          kelembapan: openMeteo.relative_humidity_2m,
          curahHujan: openMeteo.precipitation,
          kodeCuaca: openMeteo.weather_code,
          kecepatanAngin: openMeteo.wind_speed_10m,
        }
      : null,
  };

  try {
    const jsonLine = JSON.stringify(record) + '\n';
    fs.appendFileSync(HISTORY_LOG_FILE, jsonLine, 'utf8');
    writeSystemLog('INFO', `Data cuaca berhasil dicatat ke riwayat. Status: ${summary.status}`);
  } catch (error) {
    writeSystemLog('ERROR', `Gagal menulis riwayat cuaca: ${String(error)}`);
  }
}