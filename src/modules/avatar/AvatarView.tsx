import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface AvatarViewProps {
  name: string;
  style?: StyleProp<ViewStyle>;
}

export default function AvatarView({ name, style }: AvatarViewProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getHashColor = (fullName: string) => {
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 45%)`;
  };

  const initials = getInitials(name);
  const backgroundColor = getHashColor(name);

  return (
    <View style={[styles.fallback, { backgroundColor }, style]}>
      <Text style={styles.fallbackText}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});