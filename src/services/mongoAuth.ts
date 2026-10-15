import { MongoClient, type Collection } from 'mongodb';
import {
  initAuthCreds,
  BufferJSON,
  proto,
  type AuthenticationCreds,
  type AuthenticationState,
  type SignalDataTypeMap,
} from '@whiskeysockets/baileys';

interface SessionDocument {
  _id: string;
  data: string;
  updatedAt: Date;
}

export async function useMongoAuthState(
  mongoUri: string,
  collectionName = 'baileys_auth'
): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  closeConnection: () => Promise<void>;
}> {
  if (!mongoUri) {
    throw new Error('[MongoAuth] MONGODB_URI belum disetel di file .env');
  }

  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 15000, // Batas waktu koneksi 15 detik
  });

  console.log('[MongoAuth] Menghubungkan ke klaster MongoDB Atlas...');
  await client.connect();
  console.log('[MongoAuth] Berhasil terhubung ke MongoDB Atlas.');

  const db = client.db('margo_lestari');
  const collection: Collection<SessionDocument> = db.collection<SessionDocument>(collectionName);

  // Fungsi simpan data ke MongoDB
  const writeData = async (data: any, id: string): Promise<void> => {
    try {
      const serialized = JSON.stringify(data, BufferJSON.replacer);
      await collection.updateOne(
        { _id: id },
        { $set: { data: serialized, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[MongoAuth] Gagal menyimpan data untuk key ${id}:`, error);
    }
  };

  // Fungsi baca data dari MongoDB
  const readData = async (id: string): Promise<any | null> => {
    try {
      const doc = await collection.findOne({ _id: id });
      if (!doc?.data) return null;
      return JSON.parse(doc.data, BufferJSON.reviver);
    } catch (error) {
      console.error(`[MongoAuth] Gagal membaca data untuk key ${id}:`, error);
      return null;
    }
  };

  // Fungsi hapus data dari MongoDB
  const removeData = async (id: string): Promise<void> => {
    try {
      await collection.deleteOne({ _id: id });
    } catch (error) {
      console.error(`[MongoAuth] Gagal menghapus data untuk key ${id}:`, error);
    }
  };
  

  // Ambil data creds utama atau buat kredensial baru jika belum ada
  const creds: AuthenticationCreds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
          const data: { [key: string]: SignalDataTypeMap[T] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(creds, 'creds'),
    closeConnection: async () => {
      await client.close();
    },
  };
}