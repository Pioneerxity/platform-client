'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type OnSelectionChangeParams,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { Badge } from './components/Badge';
import { Inspector } from './components/Inspector';
import { nodeTypes } from './components/nodes';
import { NEXT, NODE_MOVE_STYLE, ROLE_BADGE, SEQUENCE } from './constants';
import { initialEdges, initialNodes } from './data';
import { ThemeContext, useTheme } from './theme';
import type { FlowEdge, FlowNode, NodeData } from './types';

function FlowWorkspace() {
  const { tokens: t, isDark, setDark } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [isInspectorOpen, setInspectorOpen] = useState(true);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getNode, setCenter } = useReactFlow<FlowNode, FlowEdge>();

  const onConnect = useCallback(
    (connection: Connection) => {
      const source = connection.source ? getNode(connection.source) : null;
      const target = connection.target ? getNode(connection.target) : null;
      const ok =
        source && target
          ? NEXT[(source.data as NodeData).kind].includes((target.data as NodeData).kind)
          : false;
      if (!ok) {
        console.warn('Blocked connection', connection);
        return;
      }
      setEdges((current) =>
        addEdge<FlowEdge>(
          {
            ...connection,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          current,
        ),
      );
    },
    [getNode, setEdges],
  );

  const exportFlow = useCallback(() => {
    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      nodes: nodes.map(({ id, position, type, data }) => ({ id, position, type, data })),
      edges: edges.map(({ id, source, target, label }) => ({ id, source, target, label })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `workplace-flow-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const validatePipeline = useCallback(() => {
    if (!nodes.length) {
      setValidationMsg('Pipeline is empty.');
      return;
    }

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const startNode = nodes.find((node) => (node.data as NodeData).kind === 'start');
    if (!startNode) {
      setValidationMsg('Missing START node.');
      return;
    }

    const orderedIds = [startNode.id];
    const visited = new Set<string>([startNode.id]);
    let currentKind = (startNode.data as NodeData).kind;
    let currentId = startNode.id;

    while (currentKind !== 'end') {
      const expectedNextKinds = NEXT[currentKind];
      const outgoing = edges.filter((edge) => edge.source === currentId);
      if (!outgoing.length) {
        setValidationMsg(`No outgoing edge from ${ROLE_BADGE[currentKind]}.`);
        return;
      }

      const nextEdge = outgoing.find((edge) => {
        const nextNode = byId.get(edge.target);
        if (!nextNode) return false;
        return expectedNextKinds.includes((nextNode.data as NodeData).kind);
      });

      if (!nextEdge) {
        setValidationMsg(`Connection from ${ROLE_BADGE[currentKind]} violates the pipeline order.`);
        return;
      }

      const nextNode = byId.get(nextEdge.target)!;
      const nextKind = (nextNode.data as NodeData).kind;
      if (visited.has(nextNode.id)) {
        setValidationMsg('Detected a cycle in the pipeline.');
        return;
      }

      visited.add(nextNode.id);
      orderedIds.push(nextNode.id);
      currentId = nextNode.id;
      currentKind = nextKind;
    }

    setValidationMsg(
      `✅ Valid pipeline. Order: ${orderedIds
        .map((id) => ROLE_BADGE[(byId.get(id)!.data as NodeData).kind])
        .join(' → ')}`,
    );
  }, [nodes, edges]);

  const autoLayout = useCallback(() => {
    const spacingX = 320;
    const baseY = 120;

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setNodes((current) =>
      current.map((node) => {
        const kind = (node.data as NodeData).kind;
        const index = SEQUENCE.indexOf(kind);
        if (index === -1) return node;
        return {
          ...node,
          position: {
            x: 80 + index * spacingX,
            y: baseY,
          },
          style: { ...(node.style ?? {}), ...NODE_MOVE_STYLE },
        };
      }),
    );

    animationTimeoutRef.current = setTimeout(() => {
      setNodes((current) =>
        current.map((node) => {
          const style = node.style;
          if (!style?.transition) {
            return node;
          }
          const { transition: _transition, ...rest } = style;
          return {
            ...node,
            style: Object.keys(rest).length ? rest : undefined,
          };
        }),
      );
    }, 480);
  }, [setNodes]);

  useEffect(() => () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams<FlowNode, FlowEdge>) => {
    setSelectedId(params.nodes[0]?.id ?? null);
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const updateSelected = useCallback(
    (updater: (node: FlowNode) => FlowNode) => {
      if (!selectedId) return;
      setNodes((current) => current.map((node) => (node.id === selectedId ? updater(node) : node)));
    },
    [selectedId, setNodes],
  );

  const focusSelected = useCallback(() => {
    if (!selectedId) return;
    const node = getNode(selectedId);
    if (!node) return;
    setCenter(node.position.x + 150, node.position.y + 80, { zoom: 0.9, duration: 300 });
  }, [selectedId, getNode, setCenter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'f') return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      focusSelected();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSelected]);

  return (
    <ThemeContext.Provider value={t}>
      <div style={{ height: '100vh', width: '100vw', background: t.bg, color: t.text }}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            display: 'flex',
            gap: 12,
            background: t.panel,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: '10px 12px',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
          }}
        >
          <button
            type="button"
            onClick={validatePipeline}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: t.chip,
              cursor: 'pointer',
            }}
          >
            Validate
          </button>
          <button
            type="button"
            onClick={exportFlow}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: t.chip,
              cursor: 'pointer',
            }}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={autoLayout}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: t.chipAccent,
              cursor: 'pointer',
            }}
          >
            Auto Layout
          </button>
          <button
            type="button"
            onClick={() => setInspectorOpen((open) => !open)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: isInspectorOpen ? t.chip : t.chipAccent,
              cursor: 'pointer',
            }}
          >
            {isInspectorOpen ? 'Hide Inspector' : 'Show Inspector'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.subtext }}>
            <input type="checkbox" checked={isDark} onChange={(event) => setDark(event.target.checked)} />
            Dark mode
          </label>
        </div>

        {validationMsg && (
          <div
            style={{
              position: 'absolute',
              top: 70,
              left: 16,
              zIndex: 10,
              maxWidth: 520,
              background: t.panel,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: 13,
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
            }}
          >
            {validationMsg}
          </div>
        )}

        {isInspectorOpen && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 340,
              zIndex: 10,
              background: t.panel,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Inspector</span>
              <Badge text={selectedNode ? ROLE_BADGE[(selectedNode.data as NodeData).kind] : '--'} tone={selectedNode ? 'accent' : 'muted'} t={t} />
            </div>
            <Inspector node={selectedNode} onChange={updateSelected} t={t} />
          </div>
        )}

        <ReactFlow<FlowNode, FlowEdge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onSelectionChange={onSelectionChange}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        >
          <MiniMap zoomable pannable style={{ background: 'transparent' }} />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <Panel position="bottom-center" style={{ background: 'transparent', color: t.subtext, fontSize: 12 }}>
            Connect strictly: {SEQUENCE.map((kind) => ROLE_BADGE[kind]).join(' → ')}
          </Panel>
        </ReactFlow>
      </div>
    </ThemeContext.Provider>
  );
}

export default function FlowPage() {
  return (
    <ReactFlowProvider>
      <FlowWorkspace />
    </ReactFlowProvider>
  );
}
