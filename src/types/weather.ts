import axios from 'axios';

const BMKG_API_URL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=18.01.13.2012';

export interface WeatherItem {
  datetime: string;
  local_datetime: string;
  t: number;
  hu: number;
  weather_desc: string;
  ws: number;
  tp?: number;
}

export async function getNearestWeatherForecast(): Promise<WeatherItem | null> {
  try {
    const response = await axios.get(BMKG_API_URL);
    const prakiraan = response.data.data;

    if (!prakiraan || prakiraan.length === 0 || !prakiraan[0].cuaca) {
      return null;
    }

    // Ratakan array 2 dimensi cuaca
    const allForecasts: WeatherItem[] = prakiraan[0].cuaca.flat();

    // Validasi isi array
    if (allForecasts.length === 0 || !allForecasts[0]) {
      return null;
    }

    const now = new Date().getTime();

    // Inisialisasi dengan elemen pertama yang sudah diverifikasi ada
    let nearestItem: WeatherItem = allForecasts[0];
    let smallestDiff = Math.abs(
      new Date(nearestItem.local_datetime.replace(' ', 'T')).getTime() - now
    );

    for (const item of allForecasts) {
      if (!item || !item.local_datetime) continue;

      const itemTime = new Date(item.local_datetime.replace(' ', 'T')).getTime();
      const diff = Math.abs(itemTime - now);

      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestItem = item;
      }
    }

    return nearestItem;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Gagal mengambil data dari API BMKG:', error.message);
    } else {
      console.error('Terjadi kesalahan tak terduga:', error);
    }
    return null;
  }
}