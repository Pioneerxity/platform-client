'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
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
    const [banner, setBanner] = useState<{
        tone: 'success' | 'error' | 'info';
        title: string;
        detail?: string;
    } | null>(null);
    const [isInspectorOpen, setInspectorOpen] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const runTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const showBanner = useCallback(
        (payload: { tone: 'success' | 'error' | 'info'; title: string; detail?: string }) => {
            setBanner(payload);
            if (bannerTimeoutRef.current) {
                clearTimeout(bannerTimeoutRef.current);
            }
            if (payload.tone !== 'error') {
                bannerTimeoutRef.current = setTimeout(() => setBanner(null), 3600);
            }
        },
        [],
    );

    const simulateRun = useCallback(() => {
        if (isRunning) return;
        setIsRunning(true);
        showBanner({ tone: 'info', title: 'Running pipeline (simulated)…' });
        if (runTimeoutRef.current) {
            clearTimeout(runTimeoutRef.current);
        }
        runTimeoutRef.current = setTimeout(() => {
            showBanner({ tone: 'success', title: 'Execution finished (simulated).' });
            setIsRunning(false);
        }, 1400);
    }, [isRunning, showBanner]);

    const validatePipeline = useCallback(() => {
        if (!nodes.length) {
            showBanner({ tone: 'error', title: 'Pipeline is empty.' });
            return;
        }

        const byId = new Map(nodes.map((node) => [node.id, node]));
        const startNode = nodes.find((node) => (node.data as NodeData).kind === 'start');
        if (!startNode) {
            showBanner({ tone: 'error', title: 'Missing START node.' });
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
                showBanner({ tone: 'error', title: `No outgoing edge from ${ROLE_BADGE[currentKind]}.` });
                return;
            }

            const nextEdge = outgoing.find((edge) => {
                const nextNode = byId.get(edge.target);
                if (!nextNode) return false;
                return expectedNextKinds.includes((nextNode.data as NodeData).kind);
            });

            if (!nextEdge) {
                showBanner({
                    tone: 'error',
                    title: `Connection from ${ROLE_BADGE[currentKind]} violates the pipeline order.`,
                });
                return;
            }

            const nextNode = byId.get(nextEdge.target)!;
            const nextKind = (nextNode.data as NodeData).kind;
            if (visited.has(nextNode.id)) {
                showBanner({ tone: 'error', title: 'Detected a cycle in the pipeline.' });
                return;
            }

            visited.add(nextNode.id);
            orderedIds.push(nextNode.id);
            currentId = nextNode.id;
            currentKind = nextKind;
        }

        const orderedTitles = orderedIds
            .map((id) => ROLE_BADGE[(byId.get(id)!.data as NodeData).kind])
            .join(' → ');

        showBanner({
            tone: 'success',
            title: 'Valid pipeline',
            detail: orderedTitles,
        });
    }, [nodes, edges, showBanner]);

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

    useEffect(
        () => () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            if (runTimeoutRef.current) {
                clearTimeout(runTimeoutRef.current);
            }
            if (bannerTimeoutRef.current) {
                clearTimeout(bannerTimeoutRef.current);
            }
        },
        [],
    );

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
            <div
                style={{ height: '100vh', width: '100vw', background: t.bg, color: t.text }}
                className="workplace-shell"
            >
                {(() => {
                    const panelStyle: CSSProperties = {
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 12px',
                        borderRadius: 999,
                        border: `1px solid ${t.border}`,
                        background: t.panel,
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
                    };

                    const buttonGroupStyle: CSSProperties = {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexWrap: 'wrap',
                    };

                    const dividerStyle: CSSProperties = {
                        width: 1,
                        height: 28,
                        background: t.border,
                        opacity: 0.7,
                    };

                    const baseButton = (accent = false): CSSProperties => ({
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: `1px solid ${accent ? 'transparent' : t.border}`,
                        background: accent ? t.chipAccent : t.chip,
                        color: t.text,
                        fontSize: 12,
                        fontWeight: accent ? 600 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'transform 0.12s ease, background 0.25s ease',
                    });

                    return (
                        <div style={panelStyle}>
                            <button
                                type="button"
                                onClick={simulateRun}
                                disabled={isRunning}
                                style={{
                                    ...baseButton(true),
                                    boxShadow: '0 10px 18px rgba(99, 102, 241, 0.18)',
                                    opacity: isRunning ? 0.7 : 1,
                                    cursor: isRunning ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <span style={{ fontSize: 14, lineHeight: 1 }}>{isRunning ? '⏳' : '▶'}</span>
                                {isRunning ? 'Running' : 'Run'}
                            </button>
                            <div style={dividerStyle} />
                            <div style={buttonGroupStyle}>
                                <button type="button" onClick={validatePipeline} style={baseButton()}>
                                    Validate
                                </button>
                                <button type="button" onClick={autoLayout} style={baseButton()}>
                                    Auto Layout
                                </button>
                                <button type="button" onClick={exportFlow} style={baseButton()}>
                                    Export JSON
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInspectorOpen((open) => !open)}
                                    style={{
                                        ...baseButton(!isInspectorOpen),
                                        background: isInspectorOpen ? t.chip : t.chipAccent,
                                        color: isInspectorOpen ? t.subtext : t.text,
                                    }}
                                >
                                    {isInspectorOpen ? 'Hide Inspector' : 'Show Inspector'}
                                </button>
                            </div>
                            <div style={dividerStyle} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.subtext }}>
                                <input type="checkbox" checked={isDark} onChange={(event) => setDark(event.target.checked)} />
                                Dark mode
                            </label>
                        </div>
                    );
                })()}

                {banner && (() => {
                    const toneColor = {
                        success: t.chipAccent,
                        error: '#fee2e2',
                        info: t.chip,
                    }[banner.tone];

                    const toneBorder = {
                        success: t.border,
                        error: '#fecaca',
                        info: t.border,
                    }[banner.tone];

                    const toneIcon = {
                        success: '✅',
                        error: '⚠️',
                        info: 'ℹ️',
                    }[banner.tone];

                    return (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 20,
                                left: 16,
                                zIndex: 10,
                                maxWidth: 520,
                                background: toneColor,
                                border: `1px solid ${toneBorder}`,
                                borderRadius: 999,
                                padding: '12px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{toneIcon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: banner.detail ? 4 : 0 }}>
                                <span style={{ color: t.text, fontWeight: 600 }}>{banner.title}</span>
                                {banner.detail && (
                                    <span style={{ color: t.subtext, fontSize: 12 }}>{banner.detail}</span>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {isInspectorOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 340,
                            maxHeight: 'calc(100vh - 32px)',
                            zIndex: 10,
                            background: t.panel,
                            border: `1px solid ${t.border}`,
                            borderRadius: 12,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            overflow: 'hidden',
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
