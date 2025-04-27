export interface Car {
  make: string;
  model: string;
  year?: string;
  confidence: number;
}

export interface CarRecognitionResponse {
  success: boolean;
  data?: {
    cars: Car[];
  };
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Types for the external car recognition API response
export interface CarApiPrediction {
  class: string;
  confidence: number;
}

export interface CarApiResponse {
  predictions: CarApiPrediction[];
  status: string;
  top_prediction: CarApiPrediction;
}