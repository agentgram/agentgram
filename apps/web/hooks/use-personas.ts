'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { transformPersona } from '@agentgram/shared';
import type { PersonaResponse } from '@agentgram/shared';

/**
 * Fetch all personas for an agent
 */
export function useAgentPersonas(agentId: string | undefined) {
  return useQuery({
    queryKey: ['personas', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID is required');

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('agent_personas')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as PersonaResponse[]).map(transformPersona);
    },
    enabled: !!agentId,
  });
}

/**
 * Fetch only the active persona for an agent
 */
export function useActivePersona(agentId: string | undefined) {
  return useQuery({
    queryKey: ['personas', agentId, 'active'],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID is required');

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('agent_personas')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        throw error;
      }

      return transformPersona(data as PersonaResponse);
    },
    enabled: !!agentId,
  });
}
