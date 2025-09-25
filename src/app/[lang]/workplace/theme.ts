'use client';

import { createContext, useMemo, useState } from 'react';

export const light = {
  bg: 'radial-gradient(1200px 600px at 10% 0%, #f1f5ff 0%, #ffffff 32%, #f7fafc 100%)',
  panel: '#ffffff',
  text: '#0f172a',
  subtext: '#475569',
  border: '#e2e8f0',
  chip: '#eef2ff',
  chipAccent: '#c7d2fe',
};

export const dark = {
  bg: 'radial-gradient(1200px 600px at 10% 0%, #0b1221 0%, #0b1221 32%, #0b1221 100%)',
  panel: '#1f2937',
  text: '#f8fafc',
  subtext: '#94a3b8',
  border: '#334155',
  chip: '#1e293b',
  chipAccent: '#3730a3',
};

export type ThemeTokens = typeof light;

export const ThemeContext = createContext<ThemeTokens>(light);

export function useTheme() {
  const [isDark, setDark] = useState(false);
  const tokens = useMemo(() => (isDark ? dark : light), [isDark]);
  return { tokens, isDark, setDark };
}
