import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AdminIconProps {
  size?: number;
  color?: string;
}

export function AdminIcon({ size = 24, color = '#5E4352' }: AdminIconProps) {
  const scale = size / 24;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Shield outline */}
      <View style={[
        styles.shield,
        {
          width: 16 * scale,
          height: 18 * scale,
          borderRadius: 2 * scale,
          borderWidth: 2 * scale,
          borderColor: color,
          backgroundColor: 'transparent',
          top: 1 * scale,
        }
      ]} />
      {/* Crown top */}
      <View style={[
        styles.crownBase,
        {
          width: 12 * scale,
          height: 3 * scale,
          backgroundColor: color,
          top: 0,
        }
      ]} />
      {/* Left crown peak */}
      <View style={[
        styles.crownPeak,
        {
          width: 3 * scale,
          height: 3 * scale,
          backgroundColor: color,
          top: -2 * scale,
          left: 6 * scale,
        }
      ]} />
      {/* Center crown peak */}
      <View style={[
        styles.crownPeak,
        {
          width: 3 * scale,
          height: 4 * scale,
          backgroundColor: color,
          top: -3 * scale,
        }
      ]} />
      {/* Right crown peak */}
      <View style={[
        styles.crownPeak,
        {
          width: 3 * scale,
          height: 3 * scale,
          backgroundColor: color,
          top: -2 * scale,
          right: 6 * scale,
        }
      ]} />
      {/* Star/badge center */}
      <View style={[
        styles.badge,
        {
          width: 6 * scale,
          height: 6 * scale,
          borderRadius: 3 * scale,
          backgroundColor: color,
          top: 8 * scale,
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shield: {
    position: 'absolute',
  },
  crownBase: {
    position: 'absolute',
  },
  crownPeak: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
  },
});
