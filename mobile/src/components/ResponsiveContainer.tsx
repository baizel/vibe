import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { responsiveStyles, isTablet, spacing } from '../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centerContent?: boolean;
  maxWidth?: number;
}

export default function ResponsiveContainer({
  children,
  style,
  centerContent = false,
  maxWidth,
}: ResponsiveContainerProps) {
  return (
    <View style={[
      styles.container,
      centerContent && styles.centered,
      { maxWidth: maxWidth || (isTablet() ? 768 : undefined) },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...responsiveStyles.container,
    paddingHorizontal: spacing.md,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});