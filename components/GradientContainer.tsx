import React, { ReactNode } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Colors = {
  primary: '#78aaa9',
  secondary: '#8cad9c',
};

type GradientContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GradientContainer({ children, style }: GradientContainerProps) {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
