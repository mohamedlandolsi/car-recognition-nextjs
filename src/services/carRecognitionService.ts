import { CarRecognitionResponse, UploadResponse } from '@/types';

/**
 * Service for Car Recognition API interactions
 */
export const carRecognitionService = {
  /**
   * Upload an image to the server for car recognition
   * @param file - The image file to upload
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use relative URL that works in both development and production
      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response not OK:', response.status, errorText);
        return { 
          success: false, 
          error: `Server error: ${response.status} ${response.statusText}` 
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      };
    }
  },

  /**
   * Recognize car make and model from an image URL
   * @param imageUrl - URL of the image to analyze
   */
  async recognizeCar(imageUrl: string): Promise<CarRecognitionResponse> {
    try {
      // Use relative URL that works in both development and production
      const response = await fetch(`/api/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Recognition response not OK:', response.status, errorText);
        return { 
          success: false, 
          error: `Server error: ${response.status} ${response.statusText}` 
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error recognizing car:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to recognize car' 
      };
    }
  },
};