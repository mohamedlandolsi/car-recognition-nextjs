import { useState } from 'react';
import { Car, CarRecognitionResponse, UploadResponse } from '@/types';
import { carRecognitionService } from '@/services/carRecognitionService';

export function useCarRecognition() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recognizedCars, setRecognizedCars] = useState<Car[]>([]);

  // Reset all states
  const reset = () => {
    setIsLoading(false);
    setError(null);
    setImageUrl(null);
    setRecognizedCars([]);
  };

  // Upload an image and recognize cars in it
  const recognizeCar = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Upload the image
      console.log('Uploading image:', file.name, file.type, file.size, 'bytes');
      const uploadResponse: UploadResponse = await carRecognitionService.uploadImage(file);
      
      if (!uploadResponse.success || !uploadResponse.imageUrl) {
        throw new Error(uploadResponse.error || 'Failed to upload image');
      }
      
      setImageUrl(uploadResponse.imageUrl);
      console.log('Image uploaded successfully');
      
      // Step 2: Recognize car from the uploaded image
      console.log('Sending image for recognition');
      const recognitionResponse: CarRecognitionResponse = await carRecognitionService.recognizeCar(uploadResponse.imageUrl);
      
      if (!recognitionResponse.success || !recognitionResponse.data) {
        throw new Error(recognitionResponse.error || 'Failed to recognize car');
      }
      
      console.log('Recognition successful, found', recognitionResponse.data.cars.length, 'cars');
      setRecognizedCars(recognitionResponse.data.cars);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error in car recognition process:', errorMessage);
      setError(errorMessage);
      // Reset the UI if there's an error
      setRecognizedCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    imageUrl,
    recognizedCars,
    recognizeCar,
    reset
  };
}