'use client';

import { useCallback, useRef, useState } from 'react';
import { Brain, GitBranch, Clock, Minus, Plus, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MemoryNode, MemoryEdge, MindMapConnectionType } from '@/types/memory';

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  profile_fact: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  relationship_context: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  },
  default: {
    bg: 'bg-muted/40',
    border: 'border-border',
    text: 'text-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

interface MemoryNodeCardProps {
  node: MemoryNode;
  onClick: (node: MemoryNode) => void;
  isSelected: boolean;
}

function MemoryNodeCard({ node, onClick, isSelected }: MemoryNodeCardProps) {
  const colors = CATEGORY_COLORS[node.category] ?? CATEGORY_COLORS.default;

  return (
    <button
      data-testid={`mindmap-node-${node.id}`}
      aria-label={`Memory node: ${node.fact}`}
      aria-pressed={isSelected}
      onClick={() => onClick(node)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: 200,
        transform: 'translate(-50%, -50%)',
      }}
      className={`rounded-lg border px-3 py-2 text-left text-xs shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:shadow-md ${colors.bg} ${colors.border} ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <p className={`font-medium leading-snug ${colors.text}`} aria-hidden="true">
        {truncate(node.fact, 60)}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
          data-testid={`mindmap-node-category-${node.id}`}
        >
          {node.category.replace('_', ' ')}
        </span>
        <span
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
          data-testid={`mindmap-node-timestamp-${node.id}`}
        >
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          {formatRelativeTime(node.lastUsedAt)}
        </span>
      </div>
    </button>
  );
}

interface SvgEdgesProps {
  edges: MemoryEdge[];
  nodes: MemoryNode[];
  connectionType: MindMapConnectionType;
}

function SvgEdges({ edges, nodes, connectionType }: SvgEdgesProps) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const visibleEdges = edges.filter((e) => {
    if (connectionType === 'temporal') return e.type === 'temporal';
    if (connectionType === 'thematic') return e.type === 'thematic';
    return true;
  });

  return (
    <svg
      data-testid="mindmap-svg-edges"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {visibleEdges.map((edge) => {
        const src = nodeById.get(edge.sourceId);
        const tgt = nodeById.get(edge.targetId);
        if (!src || !tgt) return null;

        const isThematic = edge.type === 'thematic';
        const strokeColor = isThematic ? '#8b5cf6' : '#3b82f6';
        const strokeDash = isThematic ? '4 3' : undefined;

        return (
          <line
            key={`${edge.sourceId}-${edge.targetId}-${edge.type}`}
            data-testid={`mindmap-edge-${edge.sourceId}-${edge.targetId}`}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeDasharray={strokeDash}
            strokeOpacity={0.5}
          />
        );
      })}
    </svg>
  );
}

export interface MemoryMindMapGraphProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.0;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export function MemoryMindMapGraph({ nodes, edges }: MemoryMindMapGraphProps) {
  const [zoom, setZoom] = useState(1);
  const [connectionType, setConnectionType] = useState<MindMapConnectionType>('both');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handleNodeClick = useCallback((node: MemoryNode) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const CONNECTION_TYPES: MindMapConnectionType[] = ['temporal', 'thematic', 'both'];

  return (
    <div data-testid="memory-mindmap-graph" className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Connection type toggle */}
        <div
          role="group"
          aria-label="Connection type"
          className="flex items-center gap-1.5"
          data-testid="connection-type-toggle"
        >
          {CONNECTION_TYPES.map((type) => (
            <button
              key={type}
              data-testid={`connection-type-${type}`}
              aria-pressed={connectionType === type}
              onClick={() => setConnectionType(type)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                connectionType === type
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {type === 'temporal' && <Clock className="h-3 w-3" aria-hidden="true" />}
              {type === 'thematic' && <GitBranch className="h-3 w-3" aria-hidden="true" />}
              {type === 'both' && <Brain className="h-3 w-3" aria-hidden="true" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div
          role="group"
          aria-label="Zoom controls"
          className="flex items-center gap-1"
          data-testid="zoom-controls"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Zoom out"
            data-testid="zoom-out-btn"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <button
            className="min-w-[3.5rem] rounded border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={handleZoomReset}
            aria-label="Reset zoom to 100%"
            data-testid="zoom-reset-btn"
          >
            <RotateCcw className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Zoom in"
            data-testid="zoom-in-btn"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        data-testid="mindmap-canvas"
        role="region"
        aria-label="Memory mind map canvas"
        className="relative overflow-auto rounded-xl border border-border bg-muted/20"
        style={{ height: 500 }}
      >
        {nodes.length === 0 ? (
          <div
            data-testid="mindmap-empty-state"
            className="flex h-full flex-col items-center justify-center gap-3 text-center"
          >
            <Brain className="h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">No memories to map</p>
            <p className="text-xs text-muted-foreground/70">
              Memories will appear here as nodes once the agent starts learning.
            </p>
          </div>
        ) : (
          <div
            data-testid="mindmap-scaled-inner"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              position: 'relative',
            }}
          >
            <SvgEdges edges={edges} nodes={nodes} connectionType={connectionType} />
            {nodes.map((node) => (
              <MemoryNodeCard
                key={node.id}
                node={node}
                onClick={handleNodeClick}
                isSelected={selectedNodeId === node.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected node detail panel */}
      {selectedNode && (
        <div
          data-testid="mindmap-node-detail"
          className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
          role="region"
          aria-label={`Details for memory: ${selectedNode.fact}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug text-foreground">{selectedNode.fact}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-5">
                  {selectedNode.category.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Last used {formatRelativeTime(selectedNode.lastUsedAt)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              aria-label="Close node detail"
              className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="mindmap-node-detail-close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
