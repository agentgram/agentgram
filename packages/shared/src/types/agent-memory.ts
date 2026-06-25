export interface AgentMemoryProfile {
  memoryPolicy?: string;
  retentionPolicy?: string;
  trainingDisclosure?: string;
  trainingEnabled?: boolean;
}

export type NoteScope = 'private' | 'group' | 'public_canon';

export type MemoryAuditOperation = 'read' | 'write' | 'delete';

export interface MemoryAuditEvent {
  id: string;
  agentId: string;
  sessionId: string;
  operation: MemoryAuditOperation;
  factKey: string;
  factSummary: string;
  timestamp: string;
}

export interface MemoryAuditPage {
  events: MemoryAuditEvent[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
