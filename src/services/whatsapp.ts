import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { ENV } from '../config/env.js';
import { useMongoAuthState } from './mongoAuth.js';
import { writeSystemLog } from '../utils/logger.js';
import type { WeatherSummary } from '../utils/formatter.js';

let sock: ReturnType<typeof makeWASocket> | null = null;
let isConnected = false;
let isInitialRunDone = false;

export async function initWhatsAppClient(onReady?: () => void): Promise<void> {
  try {
    writeSystemLog('INFO', 'Menghubungkan ke MongoDB Atlas untuk memuat sesi Baileys...');
    const { state, saveCreds } = await useMongoAuthState(ENV.MONGODB_URI);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n[WhatsApp] Sesi MongoDB belum ada. Pindai QR Code berikut:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        isConnected = false;
        writeSystemLog('WARN', 'Koneksi WhatsApp terputus. Mencoba menghubungkan ulang...');

        if (shouldReconnect) {
          initWhatsAppClient(onReady);
        }
      } else if (connection === 'open') {
        isConnected = true;
        console.log('[WhatsApp] Perangkat berhasil terhubung via MongoDB Session!');
        writeSystemLog('INFO', 'Koneksi WhatsApp berhasil tersambung.');

        // Jalankan penarikan cuaca pertama kali tepat setelah koneksi siap
        if (!isInitialRunDone && onReady) {
          isInitialRunDone = true;
          onReady();
        }
      }
    });
  } catch (error) {
    console.error('[WhatsApp/MongoAuth Error] Gagal menginisialisasi sesi:', error);
    writeSystemLog('ERROR', `Gagal inisialisasi WhatsApp/MongoDB: ${String(error)}`);
  }
}

export async function sendWeatherBroadcast(summary: WeatherSummary): Promise<void> {
  const target = ENV.WHATSAPP_TARGET_JID;

  if (!target) {
    console.error('[WhatsApp] Target JID belum disetel di file .env');
    return;
  }

  if (!sock || !isConnected) {
    console.warn('[WhatsApp] Menunggu koneksi WhatsApp stabil sebelum mengirim...');
    writeSystemLog('WARN', 'Upaya pengiriman ditunda: soket WhatsApp belum siap.');
    return;
  }

  try {
    await sock.sendMessage(target, { text: summary.pesanWhatsApp });
    console.log(`[WhatsApp] Pesan berhasil dikirim ke: ${target}`);
    writeSystemLog('INFO', `Broadcast cuaca sukses terkirim ke ${target}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[WhatsApp] Gagal mengirim pesan: ${errorMsg}`);
    writeSystemLog('ERROR', `Gagal mengirim pesan ke ${target}: ${errorMsg}`);
  }
}