import { NextRequest } from 'next/server';
import {
  jsonResponse,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
  AX_PLAN_LIMITS,
} from '@agentgram/shared';
import { getAxDbClient } from '@/lib/ax-score/db';
import { generateWeeklyAlerts } from '@/lib/ax-score/alerts';

/**
 * POST /api/v1/ax-score/cron/weekly-alerts
 *
 * Cron endpoint: Generate weekly alerts for all Pro developers.
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

    const db = getAxDbClient();

    // Get all developers with Pro or Enterprise plans
    const { data: developers } = await db
      .from('developers')
      .select('id, plan')
      .in('plan', ['pro', 'enterprise']);

    if (!developers || developers.length === 0) {
      return jsonResponse(
        createSuccessResponse({ processed: 0, totalAlerts: 0 }),
        200
      );
    }

    let totalAlerts = 0;
    let processed = 0;

    for (const dev of developers) {
      const developer = dev as { id: string; plan: string };
      const limits = AX_PLAN_LIMITS[developer.plan as keyof typeof AX_PLAN_LIMITS];

      if (!limits?.alerts) continue;

      try {
        const alerts = await generateWeeklyAlerts(developer.id);
        totalAlerts += alerts.length;
        processed++;
      } catch (error) {
        console.error(`Failed to generate alerts for developer ${developer.id}:`, error);
      }
    }

    return jsonResponse(
      createSuccessResponse({ processed, totalAlerts }),
      200
    );
  } catch (error) {
    console.error('Weekly alerts cron error:', error);
    return jsonResponse(
      createErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Cron job failed'),
      500
    );
  }
}
