/**
 * Types for the Memory Mind Map visual node graph (Nomi Mind Map 2.0 parity).
 */

export type MindMapConnectionType = 'temporal' | 'thematic' | 'both';

export interface MemoryNode {
  id: string;
  /** The memory fact text displayed in the node. */
  fact: string;
  /** Memory category, e.g. "profile_fact" or "relationship_context". */
  category: string;
  /** ISO timestamp of when the memory was last accessed or updated. */
  lastUsedAt: string;
  /** X position (px) on the mind map canvas. */
  x: number;
  /** Y position (px) on the mind map canvas. */
  y: number;
}

export interface MemoryEdge {
  sourceId: string;
  targetId: string;
  /**
   * temporal — edge connects nodes close in time.
   * thematic — edge connects nodes sharing a topic or category.
   */
  type: 'temporal' | 'thematic';
}
