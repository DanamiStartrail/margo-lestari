import { formatWeatherBroadcast } from './utils/formatter.js';
import type { WeatherItem } from './types/weather.js';
import type { OpenMeteoCurrentData } from './types/openmeteo.js';

// 1. Data Dummy Cuaca Normal (Status: AMAN)
const mockDataAman: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Cerah Berawan',
    t: 28,
    hu: 75,
    tp: 0, // Curah hujan 0 mm
    ws: 5,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 28.2,
    relative_humidity_2m: 74,
    precipitation: 0,
    weather_code: 1,
    wind_speed_10m: 5.2,
  } as OpenMeteoCurrentData,
};

// 2. Data Dummy Potensi Hujan Sedang (Status: WASPADA)
const mockDataWaspada: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Hujan Sedang',
    t: 24,
    hu: 88,
    tp: 25, // Curah hujan 25 mm (kategori 20 - 50 mm)
    ws: 18,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 24.0,
    relative_humidity_2m: 89,
    precipitation: 22,
    weather_code: 63,
    wind_speed_10m: 17.5,
  } as OpenMeteoCurrentData,
};

// 3. Data Dummy Potensi Hujan Lebat / Darurat (Status: SIAGA)
const mockDataSiaga: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Hujan Badai / Lebat',
    t: 22,
    hu: 95,
    tp: 65, // Curah hujan > 50 mm (kategori ekstrem)
    ws: 35,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 21.8,
    relative_humidity_2m: 96,
    precipitation: 60,
    weather_code: 95,
    wind_speed_10m: 34.0,
  } as OpenMeteoCurrentData,
};

function previewAllMessages() {
  console.log('\n==================================================');
  console.log(' SIMULASI FORMAT PESAN WHATSAPP MARGO LESTARI');
  console.log('==================================================\n');

  // Format masing-masing skenario
  const pesanAman = formatWeatherBroadcast(mockDataAman.bmkg, mockDataAman.openMeteo);
  const pesanWaspada = formatWeatherBroadcast(mockDataWaspada.bmkg, mockDataWaspada.openMeteo);
  const pesanSiaga = formatWeatherBroadcast(mockDataSiaga.bmkg, mockDataSiaga.openMeteo);

  console.log(`>>> HASIL 1: [STATUS: ${pesanAman.status}] <<<`);
  console.log(pesanAman.pesanWhatsApp);
  console.log('\n--------------------------------------------------\n');

  console.log(`>>> HASIL 2: [STATUS: ${pesanWaspada.status}] <<<`);
  console.log(pesanWaspada.pesanWhatsApp);
  console.log('\n--------------------------------------------------\n');

  console.log(`>>> HASIL 3: [STATUS: ${pesanSiaga.status}] <<<`);
  console.log(pesanSiaga.pesanWhatsApp);
  console.log('\n==================================================');
}

previewAllMessages();