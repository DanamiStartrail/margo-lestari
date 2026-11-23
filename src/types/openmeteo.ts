export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  precipitation: string;
  weather_code: string;
  wind_speed_10m: string;
}

export interface OpenMeteoCurrentData {
  time: string;
  interval: number | null;
  temperature_2m: number | null;
  relative_humidity_2m: number | null;
  precipitation: number | null;
  weather_code: number | null;
  wind_speed_10m: number | null;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentData;
}

export interface OpenMeteoHourlyData {
  time: string[];
  precipitation: Array<number | null>;
  precipitation_probability: Array<number | null>;
  temperature_2m: Array<number | null>;
  relative_humidity_2m: Array<number | null>;
  dew_point_2m: Array<number | null>;
  cloud_cover: Array<number | null>;
  surface_pressure: Array<number | null>;
  cape: Array<number | null>;
  wind_speed_10m: Array<number | null>;
  wind_gusts_10m: Array<number | null>;
  weather_code: Array<number | null>;
}

export interface OpenMeteoHourlyResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: OpenMeteoHourlyData;
}