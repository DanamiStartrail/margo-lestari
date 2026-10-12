import axios from 'axios';
import cron from 'node-cron';

// Konstanta Endpoint API BMKG untuk Desa Margo Lestari
const BMKG_API_URL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=18.01.13.2012';

interface WeatherData {
  local_datetime: string;
  t: number;
  hu: number;
  weather_desc: string;
  ws: number;
}

// Fungsi utama untuk mengambil dan memproses data cuaca
async function fetchAndProcessWeather(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] Mengambil data cuaca dari BMKG...`);
    const response = await axios.get(BMKG_API_URL);
    
    const lokasi = response.data.lokasi;
    const prakiraanList = response.data.data;

    console.log(`Berhasil terhubung untuk Wilayah: Desa ${lokasi.desa}, Kec. ${lokasi.kecamatan}`);

    if (prakiraanList && prakiraanList.length > 0) {
      // Mengambil data cuaca periode terdekat dari struktur JSON BMKG
      const currentForecast: WeatherData = prakiraanList[0].cuaca[0][0];

      console.log('--- Ringkasan Cuaca Terbaru ---');
      console.log(`Waktu Lokal : ${currentForecast.local_datetime}`);
      console.log(`Suhu        : ${currentForecast.t}°C`);
      console.log(`Kelembapan  : ${currentForecast.hu}%`);
      console.log(`Kondisi     : ${currentForecast.weather_desc}`);
      console.log(`Kecepatan Awan/Angin: ${currentForecast.ws} km/jam`);

      // TODO: Lanjutkan dengan logika pengiriman ke WhatsApp Automation / WhatsApp Channel
      // broadcastToWhatsAppChannel(currentForecast);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Gagal mengambil data dari API BMKG:', error.message);
    } else {
      console.error('Terjadi kesalahan tak terduga:', error);
    }
  }
}

// Penjadwalan Cron Job (Contoh: Berjalan setiap 3 jam sekali)
// Format cron: '0 */3 * * *' berarti setiap 3 jam
cron.schedule('0 */3 * * *', () => {
  console.log('Menjalankan cron job pengecekan cuaca berkala...');
  fetchAndProcessWeather();
});

// Menjalankan sekali di awal untuk pengujian manual
console.log('Sistem backend Margo Lestari (TypeScript) dimulai...');
fetchAndProcessWeather();