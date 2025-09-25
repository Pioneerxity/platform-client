'use client';

import React from 'react';

import type { ThemeTokens } from '../theme';

type BadgeProps = {
  text: string;
  tone?: 'accent' | 'muted';
  t: ThemeTokens;
};

export function Badge({ text, tone = 'muted', t }: BadgeProps) {
  const background = tone === 'accent' ? t.chipAccent : t.chip;
  const color = tone === 'accent' ? t.text : t.subtext;

  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        background,
        color,
        border: `1px solid ${t.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}
