import axios, { type AxiosInstance } from 'axios';
import * as ort from 'onnxruntime-node';

export interface PredictionInput {
  rainSum1h: number;
  rainSum3h: number;
  rainSum6h: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  pressureChange3h: number;
  cloudCover: number;
  precipitationProbability: number;
  cape: number;
  windGust: number;
}

export interface PredictionOutput {
  rain3hMm: number;
  heavyRainProbability: number;
  confidence: number;
}

export interface Predictor {
  predict(input: PredictionInput): Promise<PredictionOutput>;
}

export class FastApiPredictor implements Predictor {
  private readonly client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL, timeout: 3_000 });
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const response = await this.client.post<PredictionOutput>('/predict', input);
    return response.data;
  }
}

export class OnnxPredictor implements Predictor {
  private constructor(private readonly session: ort.InferenceSession) {}

  static async create(modelPath: string): Promise<OnnxPredictor> {
    return new OnnxPredictor(await ort.InferenceSession.create(modelPath));
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const values = new Float32Array(Object.values(input));
    const features = new ort.Tensor('float32', values, [1, values.length]);
    const output = await this.session.run({ features });
    const rain3h = output.rain3h;
    const heavyRainProbability = output.heavyRainProbability;
    if (!rain3h || !heavyRainProbability) {
      throw new Error('Output model ONNX tidak lengkap');
    }
    return {
      rain3hMm: Number(rain3h.data[0]),
      heavyRainProbability: Number(heavyRainProbability.data[0]),
      confidence: Number(output.confidence?.data[0] ?? 0),
    };
  }
}
