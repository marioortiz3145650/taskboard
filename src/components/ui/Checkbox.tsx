import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

/* eslint-disable react-hooks/refs */
export function Checkbox({ checked, onChange }: CheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(1));
  const checkAnim = useRef(new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(checkAnim.current, {
        toValue: checked ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim.current, {
          toValue: 0.85,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim.current, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [checked]);

  return (
    <Pressable
      onPress={onChange}
      style={({ pressed }) => [
        styles.checkboxContainer,
        checked ? styles.checkedContainer : styles.uncheckedContainer,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View style={[styles.checkWrapper, { transform: [{ scale: scaleAnim.current }], opacity: checkAnim.current }]}>
        <Ionicons name="checkmark-sharp" size={15} color="#FFFFFF" style={styles.iconStyle} />
      </Animated.View>
    </Pressable>
  );
}
/* eslint-enable react-hooks/refs */

const styles = StyleSheet.create({
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedContainer: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkedContainer: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  iconStyle: {
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
