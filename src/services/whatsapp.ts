import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { writeSystemLog } from '../utils/logger.js';
import type { WeatherSummary } from '../utils/formatter.js';

let sock: ReturnType<typeof makeWASocket> | null = null;
let isConnected = false;

/**
 * Inisialisasi koneksi WhatsApp Web via Baileys
 */
export async function initWhatsAppClient(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }), // Sembunyikan log bawaan yang bising
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n[WhatsApp] Pindai QR Code berikut menggunakan WhatsApp di ponsel:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      isConnected = false;
      writeSystemLog('WARN', 'Koneksi WhatsApp terputus. Mencoba menghubungkan ulang...');

      if (shouldReconnect) {
        initWhatsAppClient();
      }
    } else if (connection === 'open') {
      isConnected = true;
      console.log('[WhatsApp] Perangkat berhasil terhubung!');
      writeSystemLog('INFO', 'Koneksi WhatsApp berhasil tersambung.');
    }
  });
}

/**
 * Mengirim pesan siaran ke target JID
 */
export async function sendWeatherBroadcast(summary: WeatherSummary): Promise<void> {
  const target = process.env.WHATSAPP_TARGET_JID;

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