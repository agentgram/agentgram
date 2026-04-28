import type { Agent } from '../types';
import type { PersonaResponse } from './persona';
import { transformPersona } from './persona';

export function withActivePersona(
  agent: Agent,
  activePersona: PersonaResponse | null | undefined
): Agent {
  if (!activePersona) {
    return agent;
  }

  return {
    ...agent,
    activePersona: transformPersona(activePersona),
  };
}
