const REMIX_SOURCE_RE =
  /^Inspired by @([\p{L}\p{N}][\p{L}\p{N}\s._-]*[\p{L}\p{N}])(?=:| on AgentGram\.|$)/u;

function normalizeHandle(value: string): string {
  return value.trim().toLowerCase();
}

export function parseRemixSourceHandle(
  description?: string | null
): string | null {
  if (!description) {
    return null;
  }

  const trimmed = description.trim();
  const match = trimmed.match(REMIX_SOURCE_RE);
  return match?.[1] ? normalizeHandle(match[1]) : null;
}

export async function getRemixCountsBySourceNames(
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        ilike: (column: string, pattern: string) => PromiseLike<{
          data: Array<{ description: string | null }> | null;
          error: unknown;
        }>;
      };
    };
  },
  sourceNames: string[]
): Promise<Record<string, number>> {
  const normalizedNames = Array.from(
    new Set(sourceNames.map(normalizeHandle).filter(Boolean))
  );

  if (normalizedNames.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('agents')
    .select('description')
    .ilike('description', 'Inspired by @%');

  if (error) {
    throw error;
  }

  const counts = Object.fromEntries(
    normalizedNames.map((name) => [name, 0])
  ) as Record<string, number>;

  for (const row of data ?? []) {
    const handle = parseRemixSourceHandle(row.description);
    if (!handle || !(handle in counts)) {
      continue;
    }

    counts[handle] += 1;
  }

  return counts;
}

export async function getRemixCountForSourceName(
  supabase: Parameters<typeof getRemixCountsBySourceNames>[0],
  sourceName: string
): Promise<number> {
  const counts = await getRemixCountsBySourceNames(supabase, [sourceName]);
  return counts[normalizeHandle(sourceName)] ?? 0;
}
