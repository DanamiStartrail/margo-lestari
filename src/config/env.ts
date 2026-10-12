import dotenv from 'dotenv';
import path from 'path';

// Memuat file .env dari root direktori
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Informasi Lokasi Mitra
  village: {
    name: process.env.VILLAGE_NAME || 'Desa Margo Lestari',
    latitude: parseFloat(process.env.LATITUDE || '-5.35'),
    longitude: parseFloat(process.env.LONGITUDE || '105.35'),
  },

  // WhatsApp & Testing
  testPhoneNumber: process.env.TEST_PHONE_NUMBER || '',

  // Cron Job Schedule
  cronSchedule: process.env.CRON_SCHEDULE || '0 6,17 * * *',
};

// Validasi sederhana saat aplikasi pertama kali berjalan
if (!CONFIG.testPhoneNumber && CONFIG.nodeEnv === 'development') {
  console.warn('⚠️ [WARNING]: TEST_PHONE_NUMBER belum diisi di file .env');
}