'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

// Function to compress image before upload
const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Start with a reasonable quality and dimensions
        const quality = 0.7;
        const MAX_WIDTH = 1200; // Reduced from 1920 to 1200
        
        // Scale down the image if it's too large
        if (width > MAX_WIDTH) {
          const ratio = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try to create a compressed image with progressive quality reduction
        const tryCompression = (attemptQuality: number, maxAttempts: number = 3, attempt: number = 1) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }
              
              // Check if the blob size is within limit (with a buffer)
              const blobSizeMB = blob.size / (1024 * 1024);
              console.log(`Compression attempt ${attempt}, quality: ${attemptQuality.toFixed(2)}, size: ${blobSizeMB.toFixed(2)}MB`);
              
              // If the blob is too large and we haven't reached max attempts, try again with lower quality
              if (blobSizeMB > (maxSizeMB * 0.9) && attempt < maxAttempts) {
                // Reduce quality more aggressively for larger files
                const nextQuality = attemptQuality * 0.7;
                tryCompression(nextQuality, maxAttempts, attempt + 1);
                return;
              }
              
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg', // Always use JPEG for consistent compression
                lastModified: Date.now(),
              });
              
              console.log(`Original size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, Compressed size: ${(newFile.size / (1024 * 1024)).toFixed(2)}MB, Compression ratio: ${(newFile.size / file.size * 100).toFixed(1)}%`);
              resolve(newFile);
            },
            'image/jpeg',
            attemptQuality
          );
        };
        
        // Start compression with initial quality
        tryCompression(quality);
      };
      
      img.onerror = () => {
        reject(new Error('Error loading image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
  });
};

export function FileUploader({
  onFileSelected,
  acceptedFileTypes = 'image/*',
  maxSizeMB = 5
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const validateAndProcessFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      setIsUploading(false);
      return;
    }
    
    // Check file size before attempting compression
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`Original file size: ${fileSizeMB.toFixed(2)}MB`);
    
    // If file is excessively large, warn the user it may take longer to process
    if (fileSizeMB > 20) {
      console.warn(`Very large image detected (${fileSizeMB.toFixed(2)}MB). Compression may take longer.`);
      // Could optionally show a warning to the user here
    }
    
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file, maxSizeMB);
      
      // Double-check the final size after compression
      const finalSizeMB = compressedFile.size / (1024 * 1024);
      if (finalSizeMB > maxSizeMB) {
        console.warn(`Warning: Compressed image is still ${finalSizeMB.toFixed(2)}MB, which exceeds the ${maxSizeMB}MB limit.`);
        setError(`Image is too large (${finalSizeMB.toFixed(1)}MB). Please try a smaller image or reduce its quality before uploading.`);
        setIsUploading(false);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedFile);
      
      // Pass compressed file to parent component
      onFileSelected(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setError('Failed to process the image. Please try a different one.');
      setIsUploading(false);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      // Trigger file input but in camera mode for mobile devices
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      
      // Remove capture attribute after click to make it work normally next time
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture');
        }
      }, 1000);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {!previewUrl ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-300",
            dragOver 
              ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-[0_0_15px_rgba(var(--color-primary-rgb)/0.3)]" 
              : "border-secondary-300 dark:border-secondary-700 hover:border-primary hover:bg-secondary-50 dark:hover:bg-secondary-800/50",
            "h-64 cursor-pointer relative overflow-hidden group"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex flex-col items-center justify-center gap-4 z-10">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary/20 transform transition-transform group-hover:scale-110 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="font-medium">
                <span className="text-primary font-semibold group-hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                PNG, JPG or GIF (max. {maxSizeMB}MB)
              </p>
            </div>
          </div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden shadow-sm border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-950 group">
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={previewUrl || ''}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority={false}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {/* Image overlay with animation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="w-full p-4 text-white text-sm font-medium">
                <p className="truncate">Image ready for recognition</p>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-lg hover:shadow-xl"
              onClick={handleRemoveImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Mobile-friendly buttons */}
      {!previewUrl && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 group border-secondary-300 dark:border-secondary-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
            onClick={handleBrowseClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-secondary-500 group-hover:text-primary transition-colors">
              <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
            Browse Gallery
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 group border-secondary-300 dark:border-secondary-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10" 
            onClick={handleCameraCapture}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-secondary-500 group-hover:text-primary transition-colors">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Take Photo
          </Button>
        </div>
      )}
      
      {isUploading && (
        <div className="relative rounded-md py-2">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1 w-full overflow-hidden bg-secondary-100 dark:bg-secondary-800 rounded-full">
              <div className="bg-primary/80 h-full animate-indeterminate-progress rounded-full"></div>
            </div>
          </div>
          <div className="text-center pt-4 text-secondary-600 dark:text-secondary-400">
            Processing image...
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-sm text-error rounded-md p-3 bg-error/10 dark:bg-error/20 border border-error/20 animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
      
      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes indeterminate-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-indeterminate-progress {
          animation: indeterminate-progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}