import axios, { type AxiosInstance } from 'axios';
import * as ort from 'onnxruntime-node';

export interface PredictionInput {
  rainSum1h?: number | null;
  rainSum3h?: number | null;
  rainSum6h?: number | null;
  precipitation1h?: number | null;
  precipitation3h?: number | null;
  precipitation6h?: number | null;
  humidity?: number | null;
  relativeHumidity?: number | null;
  dewPoint?: number | null;
  pressure?: number | null;
  surfacePressure?: number | null;
  pressureChange3h?: number | null;
  cloudCover?: number | null;
  precipitationProbability?: number | null;
  temperature?: number | null;
  cape?: number | null;
  windSpeed?: number | null;
  windGust?: number | null;
  weatherCode?: number | null;
}

export interface PredictionOutput {
  status?: 'AMAN' | 'WASPADA' | 'SIAGA';
  rain3hMm?: number | null;
  heavyRainProbability?: number | null;
  probability?: number | null;
  confidence?: number | null;
  model?: 'rule-based' | 'fastapi' | 'onnx';
}

export interface Predictor {
  predict(input: PredictionInput): Promise<PredictionOutput>;
}

export class RuleBasedPredictor implements Predictor {
  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const rainValues = [
      input.rainSum1h ?? input.precipitation1h,
      input.rainSum3h ?? input.precipitation3h,
      input.rainSum6h ?? input.precipitation6h,
    ].filter((value): value is number =>
      value !== null && value !== undefined && Number.isFinite(value));

    if (rainValues.length === 0) {
      throw new Error('RuleBasedPredictor membutuhkan data curah hujan yang valid');
    }

    const maximumRain = Math.max(...rainValues);
    return {
      status: maximumRain >= 50 ? 'SIAGA' : maximumRain >= 20 ? 'WASPADA' : 'AMAN',
      rain3hMm: input.rainSum3h ?? input.precipitation3h ?? null,
      heavyRainProbability: maximumRain >= 50 ? 1 : maximumRain >= 20 ? 0.5 : 0,
      probability: maximumRain >= 50 ? 1 : maximumRain >= 20 ? 0.5 : 0,
      confidence: 1,
      model: 'rule-based',
    };
  }
}

export class FastApiPredictor implements Predictor {
  private readonly client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL, timeout: 3_000 });
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const response = await this.client.post<PredictionOutput & {
      status?: 'AMAN' | 'WASPADA' | 'SIAGA';
    }>('/predict', input);
    return { ...response.data, model: 'fastapi' };
  }
}

export class OnnxPredictor implements Predictor {
  private constructor(private readonly session: ort.InferenceSession) {}

  static async create(modelPath: string): Promise<OnnxPredictor> {
    return new OnnxPredictor(await ort.InferenceSession.create(modelPath));
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const rawValues = [
      input.rainSum1h ?? input.precipitation1h,
      input.rainSum3h ?? input.precipitation3h,
      input.rainSum6h ?? input.precipitation6h,
      input.humidity ?? input.relativeHumidity,
      input.dewPoint,
      input.pressure ?? input.surfacePressure,
      input.pressureChange3h,
      input.cloudCover,
      input.precipitationProbability,
      input.cape,
      input.windGust ?? input.windSpeed,
    ];
    const values = Float32Array.from(
      rawValues.map((value) => value ?? -999),
    );
    const features = new ort.Tensor('float32', values, [1, values.length]);
    const output = await this.session.run({ features });
    const rain3h = output.rain3h;
    const heavyRainProbability = output.heavyRainProbability;
    if (!rain3h || !heavyRainProbability) {
      throw new Error('Output model ONNX tidak lengkap');
    }
    const probability = Number(heavyRainProbability.data[0] ?? 0);
    const rain3hMm = Number(rain3h.data[0]);
    return {
      status: probability >= 0.7 ? 'SIAGA' : probability >= 0.35 ? 'WASPADA' : 'AMAN',
      rain3hMm,
      heavyRainProbability: probability,
      probability,
      confidence: Number(output.confidence?.data[0] ?? 0),
      model: 'onnx',
    };
  }
}
