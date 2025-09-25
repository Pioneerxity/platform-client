'use client';

import { useMemo } from 'react';
import { IsValidConnection, useReactFlow } from '@xyflow/react';

import { NEXT } from '../constants';
import type { FlowEdge, FlowNode, NodeData } from '../types';

export function useMakeIsValid(): IsValidConnection<FlowEdge> {
  const { getNode } = useReactFlow<FlowNode, FlowEdge>();
  return useMemo(
    () =>
      ((connection) => {
        if (!connection.source || !connection.target) return false;
        const source = getNode(connection.source);
        const target = getNode(connection.target);
        if (!source || !target) return false;
        const sourceKind = (source.data as NodeData).kind;
        const targetKind = (target.data as NodeData).kind;
        return NEXT[sourceKind].includes(targetKind);
      }) as IsValidConnection<FlowEdge>,
    [getNode],
  );
}
