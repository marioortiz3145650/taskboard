import { ThemeProvider, DarkTheme, Slot } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthWrapper } from '@/components/AuthWrapper';

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3B82F6',
    background: '#090D16',
    card: '#090D16',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.08)',
    notification: '#EF4444',
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={AppTheme}>
      <AnimatedSplashOverlay />
      <AuthWrapper>
        <Slot />
      </AuthWrapper>
    </ThemeProvider>
  );
}

