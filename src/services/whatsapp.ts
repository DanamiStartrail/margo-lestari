import { writeSystemLog } from '../utils/logger.js';
import type { WeatherSummary } from '../utils/formatter.js';

export interface WhatsAppSendResult {
  success: boolean;
  timestamp: string;
  recipientOrChannel: string;
  error?: string;
}

/**
 * Mengirim pesan ringkasan cuaca ke Channel / Grup WhatsApp
 */
export async function sendWeatherBroadcast(
  summary: WeatherSummary,
  targetChannelId?: string
): Promise<WhatsAppSendResult> {
  const target = targetChannelId ?? process.env.WHATSAPP_TARGET_JID ?? 'default-channel';

  try {
    writeSystemLog('INFO', `Mempersiapkan pengiriman broadcast status [${summary.status}] ke ${target}...`);

    // TODO: Hubungkan dengan socket Baileys (sock.sendMessage) dari tim WhatsApp Automation
    // Simulasi pengiriman:
    console.log(`\n[WhatsApp Gateway] Mengirim pesan ke ${target}...`);
    console.log(summary.pesanWhatsApp);

    writeSystemLog('INFO', `Broadcast cuaca berhasil dikirim ke ${target}.`);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      recipientOrChannel: target,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    writeSystemLog('ERROR', `Gagal mengirim broadcast WhatsApp: ${errorMsg}`);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      recipientOrChannel: target,
      error: errorMsg,
    };
  }
}