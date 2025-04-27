import { NextRequest, NextResponse } from 'next/server';
import { Car, CarApiPrediction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check if API URL is configured
    if (!process.env.CAR_RECOGNITION_API_URL) {
      console.error('CAR_RECOGNITION_API_URL environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Car recognition API URL not configured' },
        { status: 500 }
      );
    }

    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      );
    }

    console.log('Sending request to car recognition API with image URL', imageUrl.substring(0, 50) + '...');
    
    // Extract the base64 content from the data URL
    let base64Image = imageUrl;
    if (imageUrl.startsWith('data:image')) {
      // Strip the prefix (data:image/jpeg;base64,) to get just the base64 string
      base64Image = imageUrl.split(',')[1];
    }

    // Check the size of the base64 string
    const sizeInBytes = base64Image.length * 0.75; // Approximate size in bytes (base64 is ~4/3 the size)
    const sizeInMB = sizeInBytes / (1024 * 1024);
    console.log(`Image size (approx): ${sizeInMB.toFixed(2)} MB`);

    // If image is too large, return an error with a clear message
    if (sizeInMB > 10) {
      console.warn(`Image too large for processing: ${sizeInMB.toFixed(2)} MB, exceeding 10MB limit`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image is too large. Please use an image smaller than 10MB or try the compression option.' 
        },
        { status: 413 } // Using proper 413 status code for clarity
      );
    }

    // Convert base64 string to a file/blob
    const imageType = imageUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    const byteCharacters = atob(base64Image);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: imageType });
    const file = new File([blob], "image.jpg", { type: imageType });

    // Call the actual car recognition API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Send request using FormData instead of JSON
      const response = await fetch(process.env.CAR_RECOGNITION_API_URL as string, {
        method: 'POST',
        body: formData,  // Send as FormData
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if response comes back
      
      console.log('Car API response status:', response.status);
      
      if (!response.ok) {
        // Detailed error handling
        let errorMessage = `API responded with status: ${response.status}`;
        try {
          // Try to get error details from the response body
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch {
          // Ignore error when reading response body
        }
        
        throw new Error(errorMessage);
      }

      const apiResult = await response.json();
      console.log('Car API response:', JSON.stringify(apiResult, null, 2));
      
      // Check if the API response indicates success
      if (apiResult.status !== 'success') {
        throw new Error('Car recognition API returned an error: ' + JSON.stringify(apiResult));
      }
      
      const cars: Car[] = [];
      
      // Add the top prediction if available
      if (apiResult.top_prediction) {
        const { make, model, year } = extractCarInfo(apiResult.top_prediction.class);
        cars.push({
          make,
          model,
          year,
          confidence: normalizeConfidence(apiResult.top_prediction.confidence)
        });
      }
      
      // Add other predictions from the predictions array
      if (apiResult.predictions && Array.isArray(apiResult.predictions)) {
        // Skip the first prediction if it's identical to top_prediction
        const predictions = apiResult.predictions.filter((pred: CarApiPrediction) => 
          !apiResult.top_prediction || 
          pred.class !== apiResult.top_prediction.class || 
          pred.confidence !== apiResult.top_prediction.confidence
        );
        
        predictions.forEach((pred: CarApiPrediction) => {
          const { make, model, year } = extractCarInfo(pred.class);
          cars.push({
            make,
            model,
            year,
            confidence: normalizeConfidence(pred.confidence)
          });
        });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          cars
        }
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId); // Clear the timeout in case of error
      
      // Type guard to check if the error is an AbortError
      if (
        typeof fetchError === 'object' && 
        fetchError !== null && 
        'name' in fetchError && 
        fetchError.name === 'AbortError'
      ) {
        throw new Error('Request to car recognition API timed out after 30 seconds');
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('Error recognizing car:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to recognize car';
    if (error instanceof Error) {
      if (error.message.includes('502') || error.message.includes('504')) {
        errorMessage = 'The car recognition server is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'The request took too long to complete. Please try with a smaller image or check your internet connection.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to extract make, model and year from the class string
function extractCarInfo(carClass: string): { make: string; model: string; year: string | undefined } {
  const parts = carClass.split(' ');
  const make = parts[0];
  let model = '';
  let year = undefined;
  
  // Check if the last part is a year (4 digits)
  if (parts.length > 1 && /^\d{4}$/.test(parts[parts.length - 1])) {
    year = parts[parts.length - 1];
    model = parts.slice(1, parts.length - 1).join(' ');
  } else {
    model = parts.slice(1).join(' ');
  }
  
  return { make, model, year };
}

// Helper function to normalize confidence values
// The API seems to return confidence values > 1, so we'll normalize them to a 0-1 scale
function normalizeConfidence(confidence: number): number {
  // If confidence is already between 0 and 1, return as is
  if (confidence >= 0 && confidence <= 1) {
    return confidence;
  }
  
  // Otherwise, let's convert it to a value between 0 and 1
  // Assuming the scale is roughly 0-2 for the confidence values
  return Math.min(confidence / 2, 1);
}