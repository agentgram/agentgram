/**
 * AX Score competitor benchmarking — comparison groups and ranking.
 */
import {
  getAxDbClient,
  type AxCompetitorSetRow,
  type AxCompetitorSiteRow,
  type AxSiteRow,
  type AxScanRow,
} from './db';

interface CompetitorSetWithSites extends AxCompetitorSetRow {
  sites: AxCompetitorSiteRow[];
}

interface ComparisonResult {
  setId: string;
  setName: string;
  sites: Array<{
    url: string;
    name: string | null;
    score: number | null;
  }>;
  developerSites: Array<{
    url: string;
    name: string | null;
    score: number | null;
    percentileRank: number | null;
  }>;
}

/**
 * Create a competitor set with initial URLs.
 */
export async function createCompetitorSet(
  developerId: string,
  input: { name: string; description?: string; industry?: string; urls: string[] }
): Promise<CompetitorSetWithSites> {
  const db = getAxDbClient();

  // Create the set
  const { data: set, error: setError } = await db
    .from('ax_competitor_sets')
    .insert({
      developer_id: developerId,
      name: input.name,
      description: input.description || null,
      industry: input.industry || null,
    })
    .select()
    .single();

  if (setError || !set) {
    throw new Error(`Failed to create competitor set: ${setError?.message}`);
  }

  const competitorSet = set as AxCompetitorSetRow;

  // Bulk insert competitor sites
  const sites: AxCompetitorSiteRow[] = [];

  if (input.urls.length > 0) {
    const siteRows = input.urls.map((url) => ({
      set_id: competitorSet.id,
      url,
      name: null,
      latest_score: null,
      latest_scan_id: null,
      last_scanned_at: null,
    }));

    const { data: insertedSites, error: sitesError } = await db
      .from('ax_competitor_sites')
      .insert(siteRows)
      .select();

    if (sitesError) {
      throw new Error(`Failed to insert competitor sites: ${sitesError.message}`);
    }

    if (insertedSites) {
      sites.push(...(insertedSites as AxCompetitorSiteRow[]));
    }
  }

  return { ...competitorSet, sites };
}

/**
 * Get a competitor set with its sites. Validates ownership via developer_id.
 */
export async function getCompetitorSet(
  setId: string,
  developerId: string
): Promise<CompetitorSetWithSites | null> {
  const db = getAxDbClient();

  const { data: set } = await db
    .from('ax_competitor_sets')
    .select('*')
    .eq('id', setId)
    .eq('developer_id', developerId)
    .single();

  if (!set) return null;

  const competitorSet = set as AxCompetitorSetRow;

  const { data: sites } = await db
    .from('ax_competitor_sites')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: true });

  return {
    ...competitorSet,
    sites: (sites || []) as AxCompetitorSiteRow[],
  };
}

/**
 * List all competitor sets for a developer.
 */
export async function listCompetitorSets(
  developerId: string
): Promise<AxCompetitorSetRow[]> {
  const db = getAxDbClient();

  const { data, error } = await db
    .from('ax_competitor_sets')
    .select('*')
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list competitor sets: ${error.message}`);
  }

  return (data || []) as AxCompetitorSetRow[];
}

/**
 * Get site counts for multiple competitor sets.
 */
export async function getCompetitorSetSiteCounts(
  setIds: string[]
): Promise<Record<string, number>> {
  if (setIds.length === 0) return {};

  const db = getAxDbClient();
  const counts: Record<string, number> = {};

  const { data } = await db
    .from('ax_competitor_sites')
    .select('set_id')
    .in('set_id', setIds);

  for (const row of (data || []) as { set_id: string }[]) {
    counts[row.set_id] = (counts[row.set_id] || 0) + 1;
  }

  return counts;
}

/**
 * Run a comparison between the developer's sites and a competitor set.
 * Computes percentile rank for each developer site relative to competitors.
 */
export async function runCompetitorComparison(
  setId: string,
  developerId: string
): Promise<ComparisonResult> {
  const db = getAxDbClient();

  // Get the competitor set
  const setWithSites = await getCompetitorSet(setId, developerId);
  if (!setWithSites) {
    throw new Error(`Competitor set not found: ${setId}`);
  }

  // Get the developer's active sites with latest scores
  const { data: devSitesData } = await db
    .from('ax_sites')
    .select('*')
    .eq('developer_id', developerId)
    .eq('status', 'active');

  const devSites = (devSitesData || []) as AxSiteRow[];

  // Get latest scan scores for developer sites
  const developerSiteScores: Array<{
    url: string;
    name: string | null;
    score: number | null;
  }> = [];

  for (const site of devSites) {
    const { data: latestScan } = await db
      .from('ax_scans')
      .select('score')
      .eq('site_id', site.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const scan = latestScan as Pick<AxScanRow, 'score'> | null;
    developerSiteScores.push({
      url: site.url,
      name: site.name,
      score: scan?.score ?? null,
    });
  }

  // Collect all competitor scores
  const competitorScores = setWithSites.sites.map((s) => ({
    url: s.url,
    name: s.name,
    score: s.latest_score,
  }));

  // Compute percentile ranks for developer sites
  const allScores = [
    ...competitorScores.map((s) => s.score).filter((s): s is number => s !== null),
    ...developerSiteScores.map((s) => s.score).filter((s): s is number => s !== null),
  ].sort((a, b) => a - b);

  const developerSitesWithRank = developerSiteScores.map((site) => {
    let percentileRank: number | null = null;
    const siteScore = site.score;
    if (siteScore !== null && allScores.length > 0) {
      const belowCount = allScores.filter((s) => s < siteScore).length;
      percentileRank = Math.round((belowCount / allScores.length) * 100);
    }
    return { ...site, percentileRank };
  });

  return {
    setId: setWithSites.id,
    setName: setWithSites.name,
    sites: competitorScores,
    developerSites: developerSitesWithRank,
  };
}

/**
 * Delete a competitor set. Cascade deletes its sites.
 * Validates ownership via developer_id.
 */
export async function deleteCompetitorSet(
  setId: string,
  developerId: string
): Promise<void> {
  const db = getAxDbClient();

  const { error } = await db
    .from('ax_competitor_sets')
    .delete()
    .eq('id', setId)
    .eq('developer_id', developerId);

  if (error) {
    throw new Error(`Failed to delete competitor set: ${error.message}`);
  }
}

/**
 * Add a single site to a competitor set.
 */
export async function addCompetitorSite(
  setId: string,
  url: string,
  name?: string
): Promise<AxCompetitorSiteRow> {
  const db = getAxDbClient();

  const { data, error } = await db
    .from('ax_competitor_sites')
    .insert({
      set_id: setId,
      url,
      name: name || null,
      latest_score: null,
      latest_scan_id: null,
      last_scanned_at: null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to add competitor site: ${error?.message}`);
  }

  return data as AxCompetitorSiteRow;
}

/**
 * Remove a single site from a competitor set.
 */
export async function removeCompetitorSite(
  siteId: string,
  setId: string
): Promise<void> {
  const db = getAxDbClient();

  const { error } = await db
    .from('ax_competitor_sites')
    .delete()
    .eq('id', siteId)
    .eq('set_id', setId);

  if (error) {
    throw new Error(`Failed to remove competitor site: ${error.message}`);
  }
}
