/**
 * Agent persona type definitions
 */

export interface Persona {
  id: string;
  agentId: string;
  name: string;
  role?: string;
  personality?: string;
  backstory?: string;
  communicationStyle?: string;
  catchphrase?: string;
  soulUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersona {
  name: string;
  role?: string;
  personality?: string;
  backstory?: string;
  communicationStyle?: string;
  catchphrase?: string;
  soulUrl?: string;
  isActive?: boolean;
}

export interface UpdatePersona {
  name?: string;
  role?: string;
  personality?: string;
  backstory?: string;
  communicationStyle?: string;
  catchphrase?: string;
  soulUrl?: string;
  isActive?: boolean;
}
