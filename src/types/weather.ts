export interface WeatherData {
  suhu: number;
  hujanMm: number;
  kondisi: string;
  sumber: string;
}

export interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
  };
}