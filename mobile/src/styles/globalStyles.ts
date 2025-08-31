import { StyleSheet, Platform } from 'react-native';

// Common color palette
export const colors = {
  primary: '#2ECC71',
  secondary: '#3498DB',
  danger: '#E74C3C',
  warning: '#F39C12',
  dark: '#2c3e50',
  light: '#ecf0f1',
  gray: '#95a5a6',
  lightGray: '#bdc3c7',
  background: '#f8f9fa',
  white: '#fff',
  border: '#e1e8ed',
};

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Common font sizes
export const fonts = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

// Common component styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Headers
  header: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.dark,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fonts.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.dark,
    fontSize: fonts.md,
    fontWeight: '500',
  },
  
  // Input fields
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  input: {
    height: 45,
    fontSize: fonts.md,
    color: colors.dark,
  },
  searchInput: {
    height: 45,
    fontSize: fonts.md,
    flex: 1,
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  // Text styles
  title: {
    fontSize: fonts.xxl,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.lg,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: fonts.md,
    color: colors.dark,
    lineHeight: 22,
  },
  caption: {
    fontSize: fonts.sm,
    color: colors.gray,
  },
  
  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fonts.xxl,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.dark,
  },
  emptySubtitle: {
    fontSize: fonts.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Web-specific styles
  webContainer: {
    backgroundColor: colors.background,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  desktopContent: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.lg,
  },
});

// Web header styles
export const webHeaderStyles = StyleSheet.create({
  webHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  webHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  webLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webLogoText: {
    fontSize: fonts.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  webNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  webNavItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  webNavText: {
    fontSize: fonts.md,
    color: colors.dark,
    fontWeight: '500',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'color 0.2s ease',
        '&:hover': {
          color: colors.primary,
        },
      },
    }),
  },
  webActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  webActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
        '&:hover': {
          opacity: 0.7,
        },
      },
    }),
  },
  webActionText: {
    fontSize: fonts.sm,
    color: colors.dark,
    fontWeight: '500',
  },
  webLoginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: '#27AE60',
        },
      },
    }),
  },
  webLoginText: {
    color: colors.white,
    fontSize: fonts.sm,
    fontWeight: '600',
  },
  webLayout: {
    flex: 1,
  },
  webContent: {
    flex: 1,
  },
});

// Product card styles
export const productStyles = StyleSheet.create({
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }
    }),
  },
  productCardDesktop: {
    marginBottom: spacing.lg,
    ...Platform.select({
      web: {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }
      }
    }),
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.lightGray,
  },
  productInfo: {
    padding: spacing.md,
  },
  productName: {
    fontSize: fonts.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.dark,
  },
  productDescription: {
    fontSize: fonts.xs,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  productPrice: {
    fontSize: fonts.md,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Responsive breakpoints
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1200,
};

// Helper function to get responsive values
export const getResponsiveValue = (mobile: any, tablet?: any, desktop?: any) => {
  if (Platform.OS === 'web') {
    // This would need to be implemented with a window resize listener in a real app
    const width = window.innerWidth || 1200;
    if (width >= breakpoints.desktop && desktop !== undefined) return desktop;
    if (width >= breakpoints.tablet && tablet !== undefined) return tablet;
  }
  return mobile;
};

export default {
  colors,
  spacing,
  fonts,
  commonStyles,
  webHeaderStyles,
  productStyles,
  breakpoints,
  getResponsiveValue,
};