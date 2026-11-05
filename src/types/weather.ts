// Informasi wilayah administratif BMKG
export interface BMKGLokasi {
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
  lon: number;
  lat: number;
  timezone: string;
  type?: string;
}

// Parameter cuaca per slot waktu (interval 3 jam)
export interface WeatherItem {
  datetime: string;
  utc_datetime: string;
  local_datetime: string;       // Format: YYYY-MM-DD HH:mm:ss
  t: number;                    // Suhu udara (°C)
  hu: number;                   // Kelembapan udara (%)
  tp: number;                   // Curah hujan (mm)
  weather: number;              // Kode cuaca numerik
  weather_desc: string;         // Deskripsi cuaca (Cerah, Berawan, Hujan, dll.)
  weather_desc_en?: string;     // Deskripsi cuaca bahasa Inggris
  ws: number;                   // Kecepatan angin (km/jam)
  wd: string;                   // Arah angin datang
  wd_deg?: number;              // Derajat arah angin
  wd_to?: string;               // Arah angin menuju
  tcc?: number;                 // Tutupan awan (%)
  vs?: number | null;           // Jarak pandang
  vs_text?: string | null;      // Teks jarak pandang
  time_index?: string;
  analysis_date?: string;
  image?: string;               // URL ikon cuaca SVG BMKG
}

// Data per entri wilayah di dalam array 'data'
export interface BMKGDataEntry {
  lokasi: BMKGLokasi;
  cuaca: WeatherItem[][];       // Format array 2D: cuaca[hari][interval]
}

// Struktur root response dari API BMKG
export interface BMKGWeatherResponse {
  lokasi: BMKGLokasi;
  data: BMKGDataEntry[];
}

export type SourceStatus = 'OK' | 'ERROR' | 'STALE';

export interface SourceResult<T> {
  source: 'bmkg' | 'open-meteo';
  status: SourceStatus;
  data: T | null;
  fetchedAt: string;
  error?: string;
}