'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Car } from '@/types';

interface CarResultsProps {
  cars: Car[];
}

export function CarResults({ cars }: CarResultsProps) {
  if (!cars || cars.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 w-full">
      {cars.map((car, index) => {
        // Format confidence as a percentage with 1 decimal place
        const confidencePercent = Math.round(car.confidence * 100 * 10) / 10;
        const isTopPrediction = index === 0;
        const confidenceColor = getConfidenceColor(confidencePercent);
        
        return (
          <div 
            key={index}
            className={cn(
              "transform transition-all duration-300",
              isTopPrediction 
                ? "scale-100" 
                : "scale-95 opacity-90 hover:scale-98 hover:opacity-100"
            )}
          >
            <Card 
              className={cn(
                "overflow-hidden border-2 h-full transition-all duration-300",
                isTopPrediction 
                  ? "bg-gradient-to-br from-white to-secondary-50 border-primary/30 shadow-lg shadow-primary/5" 
                  : "border-secondary-200 hover:border-secondary-300"
              )}
            >
              {isTopPrediction && (
                <div className="relative bg-primary text-primary-foreground text-xs font-medium py-1.5 text-center overflow-hidden">
                  <span className="relative z-10">Top Match</span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_1px,_transparent_1px)] bg-[length:10px_10px] opacity-40"></div>
                </div>
              )}
              
              <CardHeader className={cn(
                "pb-2 space-y-0",
                isTopPrediction && "pt-4"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-secondary-900">
                    {car.make}
                  </CardTitle>
                  {car.year && (
                    <span className="text-sm font-medium bg-secondary-100 text-secondary-700 px-2.5 py-1 rounded-full border border-secondary-200">
                      {car.year}
                    </span>
                  )}
                </div>
                <CardDescription className="text-base sm:text-lg font-medium text-secondary-800">
                  {car.model}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Match Confidence</span>
                    <span className="text-sm font-bold" style={{ color: confidenceColor }}>
                      {confidencePercent}%
                    </span>
                  </div>
                  <div className="h-3 relative bg-secondary-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${confidencePercent}%`,
                        background: `linear-gradient(90deg, ${getConfidenceGradient(confidencePercent)})`
                      }}
                    >
                      {/* Add shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 animate-shine"></div>
                    </div>
                  </div>
                </div>
                
                {/* Additional car details section with improved layout */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {getCarTags(car).map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-secondary-100/80 text-secondary-700 border border-secondary-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              {isTopPrediction && (
                <CardFooter className="pt-1 pb-4 px-6 border-t border-secondary-100 bg-secondary-50/50">
                  <div className="w-full">
                    <ul className="grid grid-cols-3 gap-3 text-sm text-secondary-600">
                      <li className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-secondary-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                          <path d="M8 17a5 5 0 0 1 0-10h8a5 5 0 0 1 0 10h-8Z" />
                          <path d="M8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" />
                          <path d="M16 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
                          <path d="M2 10h20" />
                          <path d="M2 14h20" />
                        </svg>
                        <span className="font-medium">{getCategoryForCar(car)}</span>
                      </li>
                      <li className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-secondary-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                          <circle cx="18.5" cy="17.5" r="3.5" />
                          <circle cx="5.5" cy="17.5" r="3.5" />
                          <path d="M15 17.5H9" />
                          <path d="M21.27 17.5H21a2.5 2.5 0 0 1-2.5-2.5v-2a8 8 0 0 0-8-8h-2a8 8 0 0 0-8 8v2a2.5 2.5 0 0 1-2.5 2.5" />
                          <path d="M5.5 14v3.5" />
                          <path d="M18.5 14v3.5" />
                        </svg>
                        <span className="font-medium">Auto</span>
                      </li>
                      <li className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-secondary-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M12 19v-4" />
                        </svg>
                        <span className="font-medium">{getPremiumLevel(car)}</span>
                      </li>
                    </ul>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        );
      })}
      
      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(var(--color-primary), 0.3); }
          50% { border-color: rgba(var(--color-primary), 0.6); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Helper function to get confidence color based on percentage
function getConfidenceColor(percent: number): string {
  if (percent >= 90) return 'var(--color-success, #10B981)'; // Green for high confidence
  if (percent >= 70) return 'var(--color-info, #2563EB)'; // Blue for good confidence
  if (percent >= 50) return 'var(--color-warning, #F59E0B)'; // Amber for moderate confidence
  return 'var(--color-error, #EF4444)'; // Red for low confidence
}

// Helper function to get confidence gradient based on percentage
function getConfidenceGradient(percent: number): string {
  if (percent >= 90) return 'var(--color-success, #10B981), var(--color-success-dark, #059669)';
  if (percent >= 70) return 'var(--color-info, #2563EB), var(--color-info-dark, #1D4ED8)';
  if (percent >= 50) return 'var(--color-warning, #F59E0B), var(--color-warning-dark, #D97706)';
  return 'var(--color-error, #EF4444), var(--color-error-dark, #DC2626)';
}

// Helper function to get car category based on the car details
function getCategoryForCar(car: Car): string {
  // This is a placeholder - would need real logic based on your data
  const lowerModel = car.model.toLowerCase();
  if (lowerModel.includes('suv')) return 'SUV';
  if (lowerModel.includes('truck') || lowerModel.includes('pickup')) return 'Truck';
  if (lowerModel.includes('coupe')) return 'Coupe';
  if (lowerModel.includes('convertible')) return 'Convertible';
  if (lowerModel.includes('van')) return 'Van';
  return 'Sedan'; // Default
}

// Helper function to generate car tags
function getCarTags(car: Car): string[] {
  // This is a placeholder - would need real logic based on your data
  const tags = [];
  
  // Add a color tag if we can extract it from the model name
  const possibleColors = ['red', 'blue', 'black', 'white', 'silver', 'gray', 'green', 'yellow'];
  const lowerModel = car.model.toLowerCase();
  
  for (const color of possibleColors) {
    if (lowerModel.includes(color)) {
      tags.push(`${color.charAt(0).toUpperCase() + color.slice(1)}`);
      break;
    }
  }
  
  // Add a tag based on confidence
  if (car.confidence > 0.9) tags.push('High confidence');
  else if (car.confidence > 0.7) tags.push('Good match');
  else if (car.confidence > 0.5) tags.push('Possible match');
  else tags.push('Low confidence');
  
  return tags;
}

// Helper function to determine premium level based on car make
function getPremiumLevel(car: Car): string {
  const premiumBrands = ['mercedes', 'bmw', 'audi', 'lexus', 'porsche', 'tesla', 'bentley', 'rolls-royce', 'ferrari', 'lamborghini'];
  const midTierBrands = ['acura', 'infiniti', 'volvo', 'lincoln', 'cadillac', 'buick', 'genesis', 'jaguar', 'land rover'];
  
  const lowerMake = car.make.toLowerCase();
  
  if (premiumBrands.some(brand => lowerMake.includes(brand))) {
    return 'Luxury';
  } else if (midTierBrands.some(brand => lowerMake.includes(brand))) {
    return 'Premium';
  }
  
  return 'Standard';
}