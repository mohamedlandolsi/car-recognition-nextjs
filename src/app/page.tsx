'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileUploader } from '@/components/custom/FileUploader';
import { CarResults } from '@/components/custom/CarResults';
import { Button } from '@/components/ui/button';
import { useCarRecognition } from '@/hooks/useCarRecognition';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { isLoading, error, imageUrl, recognizedCars, recognizeCar, reset } = useCarRecognition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Animation effect when results are loaded
  useEffect(() => {
    if (recognizedCars.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [recognizedCars]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    reset(); // Reset previous results when a new file is selected
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      await recognizeCar(selectedFile);
    } catch (err) {
      toast.error(`An error occurred during processing: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Recognition error:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-950">
      {/* Theme Toggle - Fixed Position */}
      {/* <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div> */}
      
      {/* Hero Section with Background */}
      <div className="relative w-full bg-gradient-to-br from-secondary-800 to-secondary-900 dark:from-secondary-900 dark:to-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('/car-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="container relative mx-auto px-4 py-10 sm:py-16 md:py-20 max-w-7xl">
          <header className="text-center max-w-3xl mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="relative h-12 w-12 rounded-xl bg-primary/20 p-2 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full text-primary">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <path d="M9 17h6"></path>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 tracking-tight">
              <span className="text-accent">AI-Powered</span> <span className="text-zinc-900">Car Recognition</span>
            </h1>
            <p className="text-secondary-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Upload an image of any car to instantly identify its make, model, and year using advanced machine learning technology
            </p>
          </header>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid md:grid-cols-5 gap-6 lg:gap-10">
          {/* Left Section (Upload) - Takes 3/5 on larger screens */}
          <div className="md:col-span-3 space-y-6">
            {/* Upload Card */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
              <div className="p-5 sm:p-6">
                <h2 className="text-xl md:text-2xl font-heading font-semibold text-secondary-900 dark:text-white mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload Car Image
                </h2>
                
                <FileUploader onFileSelected={handleFileSelected} />
                
                <div className="mt-5">
                  <Button 
                    onClick={handleRecognize} 
                    disabled={!selectedFile || isLoading}
                    className="w-full py-6 text-base relative overflow-hidden group"
                    size="lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Recognize Car
                        </span>
                        <span className="absolute inset-0 h-full w-0 bg-primary-700 transition-all duration-300 group-hover:w-full opacity-20"></span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="animate-fadeIn bg-white dark:bg-secondary-800 border-l-4 border-error rounded-r-xl p-4 shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error">Recognition Failed</h3>
                    <div className="mt-2 text-sm text-secondary-700 dark:text-secondary-300">
                      <p>{error}</p>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        Make sure you&apos;ve uploaded a clear image of a car. If the problem persists, try a different image.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Help section */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-md overflow-hidden p-5 sm:p-6">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips for Best Results
              </h3>
              <ul className="space-y-3 text-secondary-700 dark:text-secondary-300 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Upload clear, well-lit images of the car</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Side profile or 3/4 view images work best for model recognition</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ensure the entire car is visible in the frame</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Avoid extreme angles, heavy shadows, or partial shots</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Section (Results) - Takes 2/5 on larger screens */}
          <div className="md:col-span-2">
            {/* Results Card */}
            <div className={cn(
              "bg-white dark:bg-secondary-800 rounded-xl shadow-md h-full overflow-hidden transition-all duration-500",
              (imageUrl && recognizedCars.length > 0) ? "opacity-100" : "opacity-70",
              isAnimating && "animate-pulse-once"
            )}>
              <div className="p-5 sm:p-6 h-full flex flex-col">
                <h2 className="text-xl md:text-2xl font-heading font-semibold text-secondary-900 dark:text-white mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Recognition Results
                </h2>
                
                {imageUrl && recognizedCars.length > 0 ? (
                  <div className="space-y-5 flex-1 flex flex-col">
                    {/* Image preview */}
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900">
                      <Image 
                        src={imageUrl} 
                        alt="Uploaded car image" 
                        fill 
                        className="object-contain"
                        priority
                      />
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary-900/60 backdrop-blur-sm">
                          <div className="text-white text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-medium">Analyzing image...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Results */}
                    <div className="space-y-4 flex-1">
                      <CarResults cars={recognizedCars} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                    <div className="bg-secondary-100 dark:bg-secondary-700/30 rounded-full p-4 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-500 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Results Yet</h3>
                    <p className="text-secondary-500 dark:text-secondary-400 max-w-sm">
                      Upload a car image and click &quot;Recognize Car&quot; to see AI-powered identification results here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-secondary-200 dark:border-secondary-700/30 text-center text-secondary-500 dark:text-secondary-400 text-sm">
          <p>© {new Date().getFullYear()} Car Recognition App. All rights reserved.</p>
          <p className="mt-1 text-xs">Made By Mohamed Landolsi &amp; Adem Mami as a deep learning mini project.</p>
        </footer>
      </div>
      
      {/* Custom animation for Toaster */}
      <style jsx global>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-once {
          animation: pulse-once 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
