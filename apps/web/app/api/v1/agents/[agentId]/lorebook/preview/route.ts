import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@agentgram/db';
import { readAgentLorebookFromMetadata } from '@/lib/agent-lorebook';
import type {
  LorebookPersonEntry,
  LorebookPlaceEntry,
  LorebookRuleEntry,
} from '@agentgram/shared';

export interface MatchedLorebookEntry {
  id: string;
  category: 'person' | 'place' | 'rule';
  label: string;
  snippet?: string;
}

export interface LorebookPreviewResponse {
  success: true;
  data: {
    matched: MatchedLorebookEntry[];
    totalEntries: number;
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.'";:!?()[\]{}-]+/)
    .filter((t) => t.length > 2);
}

function mentionsAny(messageTokens: string[], candidateTokens: string[]): boolean {
  return candidateTokens.some((ct) => messageTokens.includes(ct));
}

function matchPeople(
  people: LorebookPersonEntry[],
  messageTokens: string[]
): MatchedLorebookEntry[] {
  return people
    .filter((p) => mentionsAny(messageTokens, tokenize(p.name)))
    .map((p) => ({
      id: p.id,
      category: 'person' as const,
      label: p.name,
      snippet: p.role ?? p.details?.slice(0, 80),
    }));
}

function matchPlaces(
  places: LorebookPlaceEntry[],
  messageTokens: string[]
): MatchedLorebookEntry[] {
  return places
    .filter((p) => mentionsAny(messageTokens, tokenize(p.name)))
    .map((p) => ({
      id: p.id,
      category: 'place' as const,
      label: p.name,
      snippet: p.details?.slice(0, 80),
    }));
}

function matchRules(rules: LorebookRuleEntry[]): MatchedLorebookEntry[] {
  // Rules are always loaded as standing directives
  return rules.map((r) => ({
    id: r.id,
    category: 'rule' as const,
    label: r.title,
    snippet: r.details?.slice(0, 80),
  }));
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await props.params;
  const message = req.nextUrl.searchParams.get('message') ?? '';

  const supabase = getSupabaseServiceClient();

  const { data: agent, error } = await supabase
    .from('agents')
    .select('metadata')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  const lorebook = readAgentLorebookFromMetadata(agent.metadata);
  const totalEntries =
    lorebook.people.length + lorebook.places.length + lorebook.rules.length;

  if (totalEntries === 0) {
    return NextResponse.json({
      success: true,
      data: { matched: [], totalEntries: 0 },
    } satisfies LorebookPreviewResponse);
  }

  const messageTokens = tokenize(message);

  const matched: MatchedLorebookEntry[] = [
    ...matchPeople(lorebook.people, messageTokens),
    ...matchPlaces(lorebook.places, messageTokens),
    ...matchRules(lorebook.rules),
  ];

  return NextResponse.json({
    success: true,
    data: { matched, totalEntries },
  } satisfies LorebookPreviewResponse);
}
