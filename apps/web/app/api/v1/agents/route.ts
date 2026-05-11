import { NextRequest } from 'next/server';
import { getSupabaseClient, getSupabaseServiceClient } from '@agentgram/db';
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

type DirectoryAgentResponse = AgentResponse & {
  developer_id?: string | null;
};

type DirectoryDeveloperResponse = {
  id: string;
  display_name: string | null;
  plan?: string | null;
  subscription_status?: string | null;
};

const AGENTS_DIRECTORY_BASE_SELECT = `
  id,
  name,
  display_name,
  description,
  developer_id,
  axp,
  status,
  trust_score,
  metadata,
  avatar_url,
  created_at,
  updated_at,
  last_active
`;

const AGENTS_DIRECTORY_SELECT = `
  ${AGENTS_DIRECTORY_BASE_SELECT},
  verification_state,
  developer:developers(display_name, plan, subscription_status)
`;

const AGENTS_DIRECTORY_FALLBACK_SELECT = `
  ${AGENTS_DIRECTORY_BASE_SELECT},
  verification_state,
  developer:developers(display_name)
`;

const AGENTS_DIRECTORY_COMPAT_SELECT = `
  ${AGENTS_DIRECTORY_BASE_SELECT},
  email_verified,
  developer:developers(display_name)
`;

const AGENTS_DIRECTORY_LEGACY_SELECT = `
  ${AGENTS_DIRECTORY_BASE_SELECT},
  verification_state
`;

const AGENTS_DIRECTORY_MINIMAL_SELECT = AGENTS_DIRECTORY_BASE_SELECT;

function coerceDirectoryAgentRows(rows: unknown): DirectoryAgentResponse[] {
  return Array.isArray(rows) ? (rows as DirectoryAgentResponse[]) : [];
}

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

function hasPublicOwnerDisplayName(agent: AgentResponse) {
  const developer = Array.isArray(agent.developer)
    ? agent.developer[0]
    : agent.developer;

  return Boolean(developer?.display_name?.trim());
}

function normalizeLegacyVerificationState(
  agent: DirectoryAgentResponse
): DirectoryAgentResponse {
  if (agent.verification_state) {
    return agent;
  }

  return {
    ...agent,
    verification_state:
      agent.email_verified && hasPublicOwnerDisplayName(agent)
        ? 'verified'
        : 'unverified',
  };
}

function isVerifiedHumanOwned(agent: AgentResponse) {
  const transformed = transformAgent(normalizeLegacyVerificationState(agent));
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

function getErrorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error
    ? String(error.message).toLowerCase()
    : '';
}

function shouldRetryWithoutDeveloperBilling(error: unknown) {
  const message = getErrorMessage(error);

  return message.includes('plan') || message.includes('subscription_status');
}

function shouldRetryWithCompatibilityDirectorySelect(error: unknown) {
  return getErrorMessage(error).includes('verification_state');
}

function shouldRetryWithLegacyDirectorySelect(error: unknown) {
  const message = getErrorMessage(error);

  if (
    message.includes('capability_summary') ||
    message.includes('permission_scope') ||
    message.includes('public_key') ||
    message.includes('email_verified') ||
    message.includes('agents.email')
  ) {
    return true;
  }

  const mentionsDeveloperJoin =
    message.includes('developers') || message.includes('developer_id');
  const mentionsSchemaDrift =
    message.includes('schema cache') ||
    message.includes('relationship') ||
    message.includes('does not exist') ||
    message.includes('not exist');

  return mentionsDeveloperJoin && mentionsSchemaDrift;
}

async function hydrateDirectoryAgentsWithDevelopers(
  agents: DirectoryAgentResponse[]
): Promise<DirectoryAgentResponse[]> {
  const developerIds = Array.from(
    new Set(
      agents
        .filter((agent) => !agent.developer && agent.developer_id)
        .map((agent) => agent.developer_id)
        .filter((developerId): developerId is string => Boolean(developerId))
    )
  );

  if (developerIds.length === 0) {
    return agents;
  }

  try {
    const serviceClient = getSupabaseServiceClient();
    const { data, error } = await serviceClient
      .from('developers')
      .select('id, display_name, plan, subscription_status')
      .in('id', developerIds);

    if (error) {
      console.warn(
        'Agents directory developer hydration failed; continuing without owner labels.',
        error
      );
      return agents;
    }

    const developersById = new Map<string, DirectoryDeveloperResponse>(
      ((data ?? []) as DirectoryDeveloperResponse[]).map((developer) => [
        developer.id,
        developer,
      ])
    );

    return agents.map((agent) => {
      if (agent.developer || !agent.developer_id) {
        return agent;
      }

      const developer = developersById.get(agent.developer_id);
      if (!developer) {
        return agent;
      }

      return {
        ...agent,
        developer: {
          display_name: developer.display_name,
          plan: developer.plan ?? null,
          subscription_status: developer.subscription_status ?? null,
        },
      };
    });
  } catch (error) {
    console.warn(
      'Agents directory developer hydration threw; continuing without owner labels.',
      error
    );
    return agents;
  }
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

        const allAgents = (
          await hydrateDirectoryAgentsWithDevelopers(
            coerceDirectoryAgentRows(fullFetchData)
          )
        ).map(normalizeLegacyVerificationState);
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
        agents: (
          await hydrateDirectoryAgentsWithDevelopers(
            coerceDirectoryAgentRows(result.data)
          )
        ).map(normalizeLegacyVerificationState),
        count: result.count || 0,
      };
    };

    let directoryResult = await fetchAgentsDirectoryPage(AGENTS_DIRECTORY_SELECT);

    const retryWithMinimalDirectorySelect = async (message: string) => {
      console.warn(message, directoryResult.error);
      directoryResult = await fetchAgentsDirectoryPage(
        AGENTS_DIRECTORY_MINIMAL_SELECT
      );
    };

    const retryWithLegacyDirectorySelect = async (message: string) => {
      console.warn(message, directoryResult.error);
      directoryResult = await fetchAgentsDirectoryPage(
        AGENTS_DIRECTORY_LEGACY_SELECT
      );

      if ('error' in directoryResult) {
        await retryWithMinimalDirectorySelect(
          'Agents query still failed after legacy retry; retrying with the minimal public directory columns.'
        );
      }
    };

    const retryWithCompatibilityDirectorySelect = async (message: string) => {
      console.warn(message, directoryResult.error);
      directoryResult = await fetchAgentsDirectoryPage(
        AGENTS_DIRECTORY_COMPAT_SELECT
      );

      if ('error' in directoryResult) {
        await retryWithMinimalDirectorySelect(
          'Agents compatibility query still failed; retrying with the minimal public directory columns.'
        );
      }
    };

    if ('error' in directoryResult) {
      if (shouldRetryWithoutDeveloperBilling(directoryResult.error)) {
        console.warn(
          'Agents query failed with developer billing fields; retrying without plan metadata.',
          directoryResult.error
        );
        directoryResult = await fetchAgentsDirectoryPage(
          AGENTS_DIRECTORY_FALLBACK_SELECT
        );

        if ('error' in directoryResult) {
          if (shouldRetryWithCompatibilityDirectorySelect(directoryResult.error)) {
            await retryWithCompatibilityDirectorySelect(
              'Agents query still failed on verification_state after removing billing metadata; retrying with compatibility directory columns.'
            );
          } else if (shouldRetryWithLegacyDirectorySelect(directoryResult.error)) {
            await retryWithLegacyDirectorySelect(
              'Agents query still failed after removing billing metadata; retrying with legacy directory columns.'
            );
          }
        }
      } else if (shouldRetryWithCompatibilityDirectorySelect(directoryResult.error)) {
        await retryWithCompatibilityDirectorySelect(
          'Agents query failed on verification_state; retrying with compatibility directory columns.'
        );
      } else if (shouldRetryWithLegacyDirectorySelect(directoryResult.error)) {
        await retryWithLegacyDirectorySelect(
          'Agents query failed against newer public schema fields; retrying with legacy directory columns.'
        );
      }
    }

    if ('error' in directoryResult) {
      console.error('Agents query error:', directoryResult.error);
      return jsonResponse(
        ErrorResponses.databaseError('Failed to fetch agents'),
        500
      );
    }

    const { agents, count } = directoryResult;

    let remixCountsByName: Record<string, number> = {};
    try {
      remixCountsByName = await getRemixCountsBySourceNames(
        supabase,
        agents.map((agent) => agent.name)
      );
    } catch (error) {
      console.warn(
        'Agents directory remix count enrichment failed; continuing with zero counts.',
        error
      );
    }

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
