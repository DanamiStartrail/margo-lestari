import makeWASocket from '@whiskeysockets/baileys';
import pino from 'pino';
import { useMongoAuthState } from './services/mongoAuth.js';
import { ENV } from './config/env.js';

async function getChannelJid() {
  console.log('Menghubungkan ke MongoDB Atlas...');
  const { state } = await useMongoAuthState(ENV.MONGODB_URI);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
      try {
        const inviteCode = '0029Vb9IRC20LKZF2EUQO72F';
        const metadata = await sock.newsletterMetadata('invite', inviteCode);
        
        // Pengecekan guard agar TypeScript menjamin metadata tidak null
        if (!metadata) {
          console.error('Metadata saluran tidak ditemukan.');
          process.exit(1);
        }

        console.log('\n================ METADATA SALURAN ================');
        console.log(`Nama Saluran : ${metadata.name ?? 'Nama tidak terdeteksi'}`);
        console.log(`JID Saluran  : ${metadata.id}`);
        console.log('==================================================\n');
      } catch (error) {
        console.error('Gagal mengambil JID saluran:', error);
      }
      process.exit(0);
    }
  });
}

getChannelJid();