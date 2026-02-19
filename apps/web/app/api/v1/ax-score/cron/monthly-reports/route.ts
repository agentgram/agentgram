import { NextRequest } from 'next/server';
import {
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
  AX_PLAN_LIMITS,
} from '@agentgram/shared';
import { getAxDbClient, type AxSiteRow } from '@/lib/ax-score/db';
import { generateMonthlyReport } from '@/lib/ax-score/monthly-reports';

/**
 * POST /api/v1/ax-score/cron/monthly-reports
 *
 * Cron endpoint: Generate monthly reports for all Pro developers.
 * Auth: Bearer token matched against AX_MONITOR_CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!secret || secret !== process.env.AX_MONITOR_CRON_SECRET) {
      return jsonResponse(
        createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid cron secret'),
        401
      );
    }

    // Calculate previous month
    const now = new Date();
    const prevMonth = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth();
    const prevYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
    const month = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const db = getAxDbClient();

    // Get all developers with Pro or Enterprise plans
    const { data: developers } = await db
      .from('developers')
      .select('id, plan')
      .in('plan', ['pro', 'enterprise']);

    if (!developers || developers.length === 0) {
      return jsonResponse(
        createSuccessResponse({ processed: 0, totalReports: 0, month }),
        200
      );
    }

    let totalReports = 0;
    let processed = 0;

    for (const dev of developers) {
      const developer = dev as { id: string; plan: string };
      const limits = AX_PLAN_LIMITS[developer.plan as keyof typeof AX_PLAN_LIMITS];

      if (!limits?.monthlyReports) continue;

      // Get active sites for this developer
      const { data: sites } = await db
        .from('ax_sites')
        .select('*')
        .eq('developer_id', developer.id)
        .eq('status', 'active');

      if (!sites || sites.length === 0) continue;

      for (const siteData of sites) {
        const site = siteData as AxSiteRow;

        try {
          await generateMonthlyReport(developer.id, site.id, month);
          totalReports++;
        } catch (error) {
          console.error(
            `Failed to generate report for developer ${developer.id}, site ${site.id}:`,
            error
          );
        }
      }

      processed++;
    }

    return jsonResponse(
      createSuccessResponse({ processed, totalReports, month }),
      200
    );
  } catch (error) {
    console.error('Monthly reports cron error:', error);
    return jsonResponse(
      createErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Cron job failed'),
      500
    );
  }
}
