import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = screenWidth * pixelDensity;
  const adjustedHeight = screenHeight * pixelDensity;
  
  return (
    (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) ||
    (pixelDensity >= 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920))
  );
};

export const isDesktop = () => screenWidth > 768;
export const isLargeDesktop = () => screenWidth > 1200;

export const isSmallScreen = () => screenWidth < 375;
export const isMediumScreen = () => screenWidth >= 375 && screenWidth < 414;
export const isLargeScreen = () => screenWidth >= 414;

// Screen dimensions
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
};

// Responsive dimensions
export const wp = (percentage: number) => (screenWidth * percentage) / 100;
export const hp = (percentage: number) => (screenHeight * percentage) / 100;

// Responsive font sizes
export const RFValue = (fontSize: number, standardScreenHeight = 812) => {
  const heightPercent = (fontSize * screenHeight) / standardScreenHeight;
  return Math.max(fontSize * 0.8, heightPercent);
};

// Spacing helpers - more consistent sizing for desktop
export const spacing = {
  xs: isDesktop() ? 8 : wp(2),   // 8px
  sm: isDesktop() ? 12 : wp(3),  // 12px
  md: isDesktop() ? 16 : wp(4),  // 16px
  lg: isDesktop() ? 24 : wp(6),  // 24px
  xl: isDesktop() ? 32 : wp(8),  // 32px
  xxl: isDesktop() ? 48 : wp(12), // 48px
};

// Layout breakpoints
export const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1920,
};

// Responsive component sizes
export const getResponsiveSize = (small: number, medium?: number, large?: number, tablet?: number) => {
  if (isTablet() && tablet) return tablet;
  if (screenWidth >= breakpoints.large && large) return large;
  if (screenWidth >= breakpoints.medium && medium) return medium;
  return small;
};

// Safe area helpers for different devices
export const getSafeAreaInsets = () => {
  // This would typically use react-native-safe-area-context
  // For now, we'll provide reasonable defaults
  const isIPhoneX = screenHeight >= 812;
  
  return {
    top: isIPhoneX ? 44 : 20,
    bottom: isIPhoneX ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Grid system
export const gridSystem = {
  container: {
    maxWidth: isTablet() ? 768 : screenWidth,
    paddingHorizontal: spacing.md,
  },
  columns: (cols: number, totalCols: number = 12, gap: number = spacing.sm) => {
    const availableWidth = screenWidth - (spacing.md * 2); // Container padding
    const gapTotal = gap * (totalCols - 1);
    const columnWidth = (availableWidth - gapTotal) / totalCols;
    return columnWidth * cols + (gap * (cols - 1));
  },
};

// Common responsive styles
export const responsiveStyles = {
  container: {
    flex: 1,
    alignSelf: 'center' as const,
    width: '100%',
  },
  
  cardPadding: {
    padding: getResponsiveSize(spacing.md, spacing.lg, spacing.xl),
  },
  
  text: {
    body: {
      fontSize: RFValue(16),
      lineHeight: RFValue(24),
    },
    heading: {
      fontSize: RFValue(24),
      lineHeight: RFValue(32),
    },
    subheading: {
      fontSize: RFValue(20),
      lineHeight: RFValue(28),
    },
    caption: {
      fontSize: RFValue(12),
      lineHeight: RFValue(16),
    },
  },
  
  button: {
    height: getResponsiveSize(44, 48, 52),
    paddingHorizontal: getResponsiveSize(spacing.lg, spacing.xl, spacing.xxl),
    borderRadius: getResponsiveSize(8, 10, 12),
  },
  
  input: {
    height: getResponsiveSize(44, 48, 52),
    paddingHorizontal: spacing.md,
    borderRadius: getResponsiveSize(8, 10, 12),
    fontSize: RFValue(16),
  },
};