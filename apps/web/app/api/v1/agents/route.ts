import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@agentgram/db';
import {
  AGENT_DIRECTORY_FILTER_CAPABILITY_KEYS,
  ErrorResponses,
  PAGINATION,
  RELATIONSHIP_GOAL_FACETS,
  WORLDBUILDING_FACETS,
  createSuccessResponse,
  jsonResponse,
  transformAgent,
  type AgentResponse,
  type RelationshipGoalFacet,
  type WorldbuildingFacet,
} from '@agentgram/shared';
import { getRemixCountsBySourceNames } from '@/lib/agents/remix-counts';

type AgentsSort = 'axp' | 'active' | 'verified_active' | 'discussed' | 'new';

type SortableQuery<TQuery> = {
  order(column: string, options: { ascending: boolean }): TQuery;
};

const AGENTS_DIRECTORY_SELECT = `
  id,
  name,
  display_name,
  description,
  public_key,
  email,
  email_verified,
  axp,
  status,
  trust_score,
  metadata,
  avatar_url,
  created_at,
  updated_at,
  last_active,
  verification_state,
  developer:developers(display_name, plan, subscription_status)
`;

const AGENTS_DIRECTORY_FALLBACK_SELECT = `
  id,
  name,
  display_name,
  description,
  public_key,
  email,
  email_verified,
  axp,
  status,
  trust_score,
  metadata,
  avatar_url,
  created_at,
  updated_at,
  last_active,
  verification_state,
  developer:developers(display_name)
`;

function isCapabilityFilterEnabled(value: string | null): boolean {
  if (value == null) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parseFacetValue<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  if (!value) {
    return undefined;
  }

  return allowed.includes(value as T) ? (value as T) : undefined;
}

function getTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function applySort<TQuery extends SortableQuery<TQuery>>(
  query: TQuery,
  sort: AgentsSort
): TQuery {
  if (sort === 'axp') {
    return query.order('axp', { ascending: false });
  }

  if (sort === 'active') {
    return query.order('last_active', { ascending: false });
  }

  if (sort === 'new') {
    return query.order('created_at', { ascending: false });
  }

  return query;
}

function isVerifiedHumanOwned(agent: AgentResponse) {
  const transformed = transformAgent(agent);
  return (
    transformed.verificationState === 'verified' &&
    Boolean(transformed.publicOwnerLabel?.trim())
  );
}

function compareVerifiedActiveAgents(a: AgentResponse, b: AgentResponse) {
  const humanOwnedDelta =
    Number(isVerifiedHumanOwned(b)) - Number(isVerifiedHumanOwned(a));
  if (humanOwnedDelta !== 0) {
    return humanOwnedDelta;
  }

  const lastActiveDelta = getTimestamp(b.last_active) - getTimestamp(a.last_active);
  if (lastActiveDelta !== 0) {
    return lastActiveDelta;
  }

  const axpDelta = (b.axp || 0) - (a.axp || 0);
  if (axpDelta !== 0) {
    return axpDelta;
  }

  return getTimestamp(b.created_at) - getTimestamp(a.created_at);
}

function matchesDiscoveryFacets(
  agent: AgentResponse,
  relationshipGoal?: RelationshipGoalFacet,
  worldbuilding?: WorldbuildingFacet
) {
  if (!relationshipGoal && !worldbuilding) {
    return true;
  }

  const transformed = transformAgent(agent);

  if (relationshipGoal && transformed.relationshipGoal !== relationshipGoal) {
    return false;
  }

  if (worldbuilding && transformed.worldbuilding !== worldbuilding) {
    return false;
  }

  return true;
}

function shouldRetryWithoutDeveloperBilling(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message).toLowerCase()
      : '';

  return message.includes('plan') || message.includes('subscription_status');
}

// GET /api/v1/agents - Fetch agent directory
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedSort = searchParams.get('sort') || 'axp';
    const sort = ['axp', 'active', 'verified_active', 'discussed', 'new'].includes(
      requestedSort
    )
      ? (requestedSort as AgentsSort)
      : 'axp';
    const page = Math.max(
      1,
      Math.min(parseInt(searchParams.get('page') || '1', 10) || 1, 10000)
    );
    const limit = Math.min(
      Math.max(
        1,
        parseInt(
          searchParams.get('limit') || String(PAGINATION.AGENTS_PER_PAGE),
          10
        ) || PAGINATION.AGENTS_PER_PAGE
      ),
      PAGINATION.MAX_LIMIT
    );
    const search = searchParams.get('search') || undefined;
    const enabledCapabilities = AGENT_DIRECTORY_FILTER_CAPABILITY_KEYS.filter(
      (key) => isCapabilityFilterEnabled(searchParams.get(key))
    );
    const relationshipGoal = parseFacetValue<RelationshipGoalFacet>(
      searchParams.get('relationship_goal'),
      RELATIONSHIP_GOAL_FACETS
    );
    const worldbuilding = parseFacetValue<WorldbuildingFacet>(
      searchParams.get('worldbuilding'),
      WORLDBUILDING_FACETS
    );
    const requiresInMemoryProcessing =
      sort === 'discussed' ||
      sort === 'verified_active' ||
      Boolean(relationshipGoal) ||
      Boolean(worldbuilding);

    const supabase = getSupabaseClient();

    const buildAgentsQuery = (selectClause: string) => {
      let query = supabase.from('agents').select(selectClause, {
        count: 'exact',
      });

      if (search) {
        const escaped = search.replace(/[%_\\]/g, '\\$&');
        query = query.or(
          `name.ilike.%${escaped}%,display_name.ilike.%${escaped}%,description.ilike.%${escaped}%`
        );
      }

      for (const capability of enabledCapabilities) {
        query = query.contains('metadata', {
          capabilities: {
            [capability]: true,
          },
        });
      }

      return query;
    };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const fetchAgentsDirectoryPage = async (selectClause: string) => {
      if (requiresInMemoryProcessing) {
        const { error: countError, count: totalCount } = await buildAgentsQuery(
          selectClause
        ).range(0, 0);

        if (countError) {
          return { error: countError };
        }

        const baseCount = totalCount || 0;
        const { data: fullFetchData, error: allAgentsError } =
          baseCount === 0
            ? { data: [], error: null }
            : await applySort(buildAgentsQuery(selectClause), sort).range(
                0,
                Math.max(baseCount - 1, 0)
              );

        if (allAgentsError) {
          return { error: allAgentsError };
        }

        const allAgents = (fullFetchData ?? []) as AgentResponse[];
        let filteredAgents = allAgents;

        if (sort === 'discussed') {
          const discussionCounts = new Map<string, number>();

          if (allAgents.length > 0) {
            const { data: discussionRows, error: discussionError } =
              await supabase
                .from('posts')
                .select('author_id, comment_count')
                .in(
                  'author_id',
                  allAgents.map((agent) => agent.id)
                )
                .is('original_post_id', null);

            if (discussionError) {
              return { error: discussionError };
            }

            for (const row of discussionRows || []) {
              if (!row.author_id) continue;

              discussionCounts.set(
                row.author_id,
                (discussionCounts.get(row.author_id) || 0) +
                  (row.comment_count || 0)
              );
            }
          }

          filteredAgents = [...allAgents].sort((a, b) => {
            const discussionDelta =
              (discussionCounts.get(b.id) || 0) -
              (discussionCounts.get(a.id) || 0);
            if (discussionDelta !== 0) return discussionDelta;

            const lastActiveDelta =
              getTimestamp(b.last_active) - getTimestamp(a.last_active);
            if (lastActiveDelta !== 0) return lastActiveDelta;

            return (b.axp || 0) - (a.axp || 0);
          });
        }

        if (sort === 'verified_active') {
          filteredAgents = [...filteredAgents].sort(compareVerifiedActiveAgents);
        }

        if (relationshipGoal || worldbuilding) {
          filteredAgents = filteredAgents.filter((agent) =>
            matchesDiscoveryFacets(agent, relationshipGoal, worldbuilding)
          );
        }

        return {
          agents: filteredAgents.slice(from, to + 1),
          count: filteredAgents.length,
        };
      }

      const result = await applySort(buildAgentsQuery(selectClause), sort).range(
        from,
        to
      );

      if (result.error) {
        return { error: result.error };
      }

      return {
        agents: (result.data ?? []) as unknown as AgentResponse[],
        count: result.count || 0,
      };
    };

    let directoryResult = await fetchAgentsDirectoryPage(AGENTS_DIRECTORY_SELECT);

    if (
      'error' in directoryResult &&
      shouldRetryWithoutDeveloperBilling(directoryResult.error)
    ) {
      console.warn(
        'Agents query failed with developer billing fields; retrying without plan metadata.',
        directoryResult.error
      );
      directoryResult = await fetchAgentsDirectoryPage(
        AGENTS_DIRECTORY_FALLBACK_SELECT
      );
    }

    if ('error' in directoryResult) {
      console.error('Agents query error:', directoryResult.error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch agents'),
        500
      );
    }

    const { agents, count } = directoryResult;

    const remixCountsByName = await getRemixCountsBySourceNames(
      supabase,
      agents.map((agent) => agent.name)
    );

    return jsonResponse(
      createSuccessResponse(
        agents.map((agent) => ({
          ...transformAgent(agent),
          remixCount: remixCountsByName[agent.name.toLowerCase()] ?? 0,
        })),
        {
          page,
          limit,
          total: count,
        }
      ),
      200
    );
  } catch (error) {
    console.error('Get agents error:', error);
    return jsonResponse(ErrorResponses.internalError(), 500);
  }
}
