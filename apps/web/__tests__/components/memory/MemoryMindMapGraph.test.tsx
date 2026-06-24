import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryMindMapGraph } from '@/components/memory/MemoryMindMapGraph';
import type { MemoryNode, MemoryEdge } from '@/types/memory';

const NOW = '2026-06-01T12:00:00.000Z';

function makeNode(id: string, overrides: Partial<MemoryNode> = {}): MemoryNode {
  return {
    id,
    fact: `Fact for ${id}`,
    category: 'profile_fact',
    lastUsedAt: NOW,
    x: 110,
    y: 80,
    ...overrides,
  };
}

function makeEdge(
  sourceId: string,
  targetId: string,
  type: MemoryEdge['type'] = 'temporal'
): MemoryEdge {
  return { sourceId, targetId, type };
}

const DEFAULT_NODES: MemoryNode[] = [
  makeNode('node-1', { x: 110, y: 80 }),
  makeNode('node-2', { x: 330, y: 80, category: 'relationship_context' }),
  makeNode('node-3', { x: 110, y: 220 }),
];

const DEFAULT_EDGES: MemoryEdge[] = [
  makeEdge('node-1', 'node-2', 'temporal'),
  makeEdge('node-2', 'node-3', 'thematic'),
];

describe('MemoryMindMapGraph', () => {
  it('renders the graph container', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('memory-mindmap-graph')).toBeInTheDocument();
  });

  it('renders all memory nodes', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    for (const node of DEFAULT_NODES) {
      expect(screen.getByTestId(`mindmap-node-${node.id}`)).toBeInTheDocument();
    }
  });

  it('renders SVG edges container', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('mindmap-svg-edges')).toBeInTheDocument();
  });

  it('renders edge lines for connected nodes', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('mindmap-edge-node-1-node-2')).toBeInTheDocument();
    expect(screen.getByTestId('mindmap-edge-node-2-node-3')).toBeInTheDocument();
  });

  it('shows category badge on each node', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('mindmap-node-category-node-1')).toHaveTextContent('profile fact');
    expect(screen.getByTestId('mindmap-node-category-node-2')).toHaveTextContent('relationship context');
  });

  it('shows last-used timestamp on each node', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    const ts = screen.getByTestId('mindmap-node-timestamp-node-1');
    expect(ts).toBeInTheDocument();
    // The timestamp text should be non-empty (relative date)
    expect(ts.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('renders zoom in and zoom out controls', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('zoom-in-btn')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-out-btn')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-reset-btn')).toBeInTheDocument();
  });

  it('increments zoom when zoom-in is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    const zoomReset = screen.getByTestId('zoom-reset-btn');
    expect(zoomReset.textContent).toContain('100%');
    fireEvent.click(screen.getByTestId('zoom-in-btn'));
    expect(zoomReset.textContent).toContain('120%');
  });

  it('decrements zoom when zoom-out is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    const zoomReset = screen.getByTestId('zoom-reset-btn');
    fireEvent.click(screen.getByTestId('zoom-out-btn'));
    expect(zoomReset.textContent).toContain('80%');
  });

  it('resets zoom to 100% when zoom-reset is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('zoom-in-btn'));
    fireEvent.click(screen.getByTestId('zoom-in-btn'));
    fireEvent.click(screen.getByTestId('zoom-reset-btn'));
    expect(screen.getByTestId('zoom-reset-btn').textContent).toContain('100%');
  });

  it('renders connection type toggle with temporal, thematic, and both options', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('connection-type-temporal')).toBeInTheDocument();
    expect(screen.getByTestId('connection-type-thematic')).toBeInTheDocument();
    expect(screen.getByTestId('connection-type-both')).toBeInTheDocument();
  });

  it('connection type toggle defaults to "both"', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('connection-type-both')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('connection-type-temporal')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('connection-type-thematic')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches connection type to temporal when temporal button is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('connection-type-temporal'));
    expect(screen.getByTestId('connection-type-temporal')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('connection-type-both')).toHaveAttribute('aria-pressed', 'false');
  });

  it('filters out thematic edges when temporal mode is active', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('connection-type-temporal'));
    // The thematic edge should not render (thematic edge is node-2 -> node-3)
    expect(screen.queryByTestId('mindmap-edge-node-2-node-3')).not.toBeInTheDocument();
    // The temporal edge should still render
    expect(screen.getByTestId('mindmap-edge-node-1-node-2')).toBeInTheDocument();
  });

  it('filters out temporal edges when thematic mode is active', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('connection-type-thematic'));
    // The temporal edge should not render
    expect(screen.queryByTestId('mindmap-edge-node-1-node-2')).not.toBeInTheDocument();
    // The thematic edge should render
    expect(screen.getByTestId('mindmap-edge-node-2-node-3')).toBeInTheDocument();
  });

  it('shows detail panel when a node is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('mindmap-node-node-1'));
    expect(screen.getByTestId('mindmap-node-detail')).toBeInTheDocument();
  });

  it('closes detail panel when close button is clicked', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('mindmap-node-node-1'));
    expect(screen.getByTestId('mindmap-node-detail')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mindmap-node-detail-close'));
    expect(screen.queryByTestId('mindmap-node-detail')).not.toBeInTheDocument();
  });

  it('deselects a node when clicked again', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    fireEvent.click(screen.getByTestId('mindmap-node-node-1'));
    expect(screen.getByTestId('mindmap-node-detail')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mindmap-node-node-1'));
    expect(screen.queryByTestId('mindmap-node-detail')).not.toBeInTheDocument();
  });

  it('renders empty state when no nodes are provided', () => {
    render(<MemoryMindMapGraph nodes={[]} edges={[]} />);
    expect(screen.getByTestId('mindmap-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No memories to map')).toBeInTheDocument();
  });

  it('does not render SVG edges in empty state', () => {
    render(<MemoryMindMapGraph nodes={[]} edges={[]} />);
    expect(screen.queryByTestId('mindmap-svg-edges')).not.toBeInTheDocument();
  });

  it('marks node as selected with aria-pressed', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    const nodeBtn = screen.getByTestId('mindmap-node-node-2');
    expect(nodeBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(nodeBtn);
    expect(nodeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('each node has an aria-label containing the fact text', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByTestId('mindmap-node-node-1')).toHaveAttribute(
      'aria-label',
      `Memory node: ${DEFAULT_NODES[0].fact}`
    );
  });

  it('zoom out does not go below minimum zoom', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    // Click zoom out many times — zoom should floor at 40% (ZOOM_MIN = 0.4)
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByTestId('zoom-out-btn'));
    }
    expect(screen.getByTestId('zoom-reset-btn').textContent).toContain('40%');
  });

  it('renders the zoom controls group with accessible label', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByRole('group', { name: 'Zoom controls' })).toBeInTheDocument();
  });

  it('renders the connection type group with accessible label', () => {
    render(<MemoryMindMapGraph nodes={DEFAULT_NODES} edges={DEFAULT_EDGES} />);
    expect(screen.getByRole('group', { name: 'Connection type' })).toBeInTheDocument();
  });
});
