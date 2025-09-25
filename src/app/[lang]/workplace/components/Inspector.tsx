'use client';

import React, { ChangeEvent } from 'react';

import { Badge } from './Badge';
import type { ThemeTokens } from '../theme';
import type { FlowNode, NodeData } from '../types';
import { ROLE_BADGE } from '../constants';

type InspectorProps = {
  node: FlowNode | null;
  onChange: (updater: (node: FlowNode) => FlowNode) => void;
  t: ThemeTokens;
};

const textareaStyle = (t: ThemeTokens) => ({
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${t.border}`,
  background: t.panel,
  color: t.text,
  fontSize: 13,
  resize: 'vertical' as const,
});

const inputStyle = (t: ThemeTokens) => ({
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${t.border}`,
  background: t.panel,
  color: t.text,
  fontSize: 13,
});

export function Inspector({ node, onChange, t }: InspectorProps) {
  if (!node) {
    return <div style={{ color: t.subtext, fontSize: 12 }}>Select a node to inspect.</div>;
  }

  const data = node.data as NodeData;

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange((current) => ({
      ...current,
      data: { ...current.data, title: nextValue },
    }));
  };

  const handleDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    onChange((current) => ({
      ...current,
      data: { ...current.data, description: nextValue },
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge text={ROLE_BADGE[data.kind]} tone="accent" t={t} />
        <span style={{ fontSize: 12, color: t.subtext }}>#{node.id}</span>
      </div>

      <label
        style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}
      >
        Title
        <input value={data.title} onChange={handleTitle} style={inputStyle(t)} />
      </label>

      <label
        style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}
      >
        Description
        <textarea
          rows={4}
          value={data.description ?? ''}
          onChange={handleDescription}
          style={textareaStyle(t)}
        />
      </label>

      <div
        style={{ fontSize: 12, color: t.subtext, display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <span>Inputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.inputs ?? []).map((item) => (
            <Badge key={item} text={item} t={t} />
          ))}
          {!data.inputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
      </div>

      <div
        style={{ fontSize: 12, color: t.subtext, display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <span>Outputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.outputs ?? []).map((item) => (
            <Badge key={item} text={item} tone="accent" t={t} />
          ))}
          {!data.outputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: t.subtext }}>Config</span>
        <pre
          style={{
            margin: 0,
            borderRadius: 8,
            padding: 12,
            background: t.bg,
            color: t.text,
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(data.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}
