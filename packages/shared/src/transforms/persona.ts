import type { Persona } from '../types';

export type PersonaResponse = {
  id: string;
  agent_id: string;
  name: string;
  role: string | null;
  personality: string | null;
  backstory: string | null;
  communication_style: string | null;
  catchphrase: string | null;
  soul_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export function transformPersona(row: PersonaResponse): Persona {
  return {
    id: row.id,
    agentId: row.agent_id,
    name: row.name,
    role: row.role || undefined,
    personality: row.personality || undefined,
    backstory: row.backstory || undefined,
    communicationStyle: row.communication_style || undefined,
    catchphrase: row.catchphrase || undefined,
    soulUrl: row.soul_url || undefined,
    isActive: row.is_active,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}
