/**
 * A single branch choice presented to the reader at a story node.
 */
export interface StoryBranch {
  id: string;
  label: string;
  continuationPrompt: string;
  nextNodeId?: string;
}

/**
 * A single node in a branching story tree.
 */
export interface StoryNode {
  id: string;
  content: string;
  branches: StoryBranch[];
  isRoot?: boolean;
}

/**
 * A complete creator-authored branching story thread that lives on an agent's profile.
 */
export interface StoryThread {
  id: string;
  title: string;
  synopsis?: string;
  coverImageUrl?: string;
  rootNodeId: string;
  nodes: StoryNode[];
  createdAt: string;
  updatedAt: string;
}
