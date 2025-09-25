'use client';

import React, { useContext } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

import { ROLE_BADGE } from '../constants';
import { ThemeContext } from '../theme';
import type { NodeData } from '../types';
import { useMakeIsValid } from '../hooks/useMakeIsValid';
import { Badge } from './Badge';

const nodeShell = (t: React.ContextType<typeof ThemeContext>) => ({
  background: t.panel,
  color: t.text,
  borderRadius: 16,
  border: `1px solid ${t.border}`,
  padding: 16,
  width: 260,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
});

const highlightedShell = (t: React.ContextType<typeof ThemeContext>) => ({
  ...nodeShell(t),
  border: `2px solid ${t.chipAccent}`,
  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.22)',
});

function StartNode({ id, data, selected }: NodeProps<NodeData>) {
  const t = useContext(ThemeContext);
  const isValid = useMakeIsValid();

  return (
    <div style={selected ? highlightedShell(t) : nodeShell(t)}>
      <Badge text="Pipeline Entry" tone="accent" t={t} />
      <h3 style={{ marginTop: 12, marginBottom: 6 }}>{data.title}</h3>
      <p style={{ margin: 0, fontSize: 12, color: t.subtext }}>{data.description}</p>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(data.outputs ?? []).map((item) => (
          <Badge key={`${id}-out-${item}`} text={item} tone="accent" t={t} />
        ))}
      </div>
      <Handle id="out" type="source" position={Position.Right} isValidConnection={isValid} />
    </div>
  );
}

function MiddleNode({ id, data, selected }: NodeProps<NodeData>) {
  const t = useContext(ThemeContext);
  const isValid = useMakeIsValid();

  return (
    <div style={selected ? highlightedShell(t) : nodeShell(t)}>
      <Badge text={ROLE_BADGE[data.kind]} t={t} />
      <h3 style={{ marginTop: 12, marginBottom: 6 }}>{data.title}</h3>
      <p style={{ margin: 0, fontSize: 12, color: t.subtext }}>{data.description}</p>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: t.subtext }}>Inputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.inputs ?? []).map((item) => (
            <Badge key={`${id}-in-${item}`} text={item} t={t} />
          ))}
          {!data.inputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: t.subtext }}>Outputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.outputs ?? []).map((item) => (
            <Badge key={`${id}-out-${item}`} text={item} tone="accent" t={t} />
          ))}
          {!data.outputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
      </div>
      <Handle id="in" type="target" position={Position.Left} isValidConnection={isValid} />
      <Handle id="out" type="source" position={Position.Right} isValidConnection={isValid} />
    </div>
  );
}

function EndNode({ data, selected }: NodeProps<NodeData>) {
  const t = useContext(ThemeContext);
  const isValid = useMakeIsValid();

  return (
    <div style={selected ? highlightedShell(t) : nodeShell(t)}>
      <Badge text="Pipeline Exit" tone="accent" t={t} />
      <h3 style={{ marginTop: 12, marginBottom: 6 }}>{data.title}</h3>
      <p style={{ margin: 0, fontSize: 12, color: t.subtext }}>{data.description}</p>
      <Handle id="in" type="target" position={Position.Left} isValidConnection={isValid} />
    </div>
  );
}

export const nodeTypes = {
  start: StartNode,
  agent: MiddleNode,
  end: EndNode,
} as const;
