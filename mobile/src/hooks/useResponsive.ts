// src/hooks/useResponsive.ts - React hook for responsive design
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { isTablet, isDesktop, isLargeDesktop, screenDimensions, getResponsiveSize } from '../utils/responsive';

interface ScreenDimensions {
  width: number;
  height: number;
}

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(screenDimensions);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    
    return () => subscription?.remove();
  }, []);
  
  const deviceType = () => {
    if (isLargeDesktop()) return 'largeDesktop';
    if (isDesktop()) return 'desktop';
    if (isTablet()) return 'tablet';
    return 'mobile';
  };
  
  const getColumns = (minWidth: number = 200) => {
    const padding = 32; // Container padding
    const gap = 16; // Gap between items
    const availableWidth = dimensions.width - padding;
    
    const columns = Math.floor(availableWidth / (minWidth + gap));
    return Math.max(1, columns);
  };
  
  const getItemWidth = (columns: number, gap: number = 16) => {
    const padding = 32; // Container padding
    const availableWidth = dimensions.width - padding;
    const totalGap = gap * (columns - 1);
    return (availableWidth - totalGap) / columns;
  };
  
  const getResponsiveColumns = () => {
    if (dimensions.width >= 1600) return 6; // Very large screens
    if (dimensions.width >= 1200) return 5; // Large desktop
    if (dimensions.width >= 900) return 4;  // Desktop
    if (dimensions.width >= 600) return 3;  // Tablet
    return 2; // Mobile
  };
  
  return {
    dimensions,
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isLargeDesktop: isLargeDesktop(),
    deviceType: deviceType(),
    getColumns,
    getItemWidth,
    getResponsiveColumns,
    getResponsiveSize,
  };
};