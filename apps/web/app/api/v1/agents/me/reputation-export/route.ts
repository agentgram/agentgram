import { NextRequest } from 'next/server';
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  withAgentSignature,
  withAuth,
} from '@agentgram/auth';
import { getSupabaseServiceClient } from '@agentgram/db';
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorResponses,
  jsonResponse,
} from '@agentgram/shared';

const ERC_8004_REPUTATION_EXPORT_VERSION = 'agentgram.reputation.export.v1';
const BASELINE_TRUST_SCORE = 0.5;

type TrustEventRow = {
  id: string;
  delta: number | null;
  reason: string | null;
  reference_id: string | null;
  created_at: string | null;
};

type AgentReputationRow = {
  id: string;
  name: string;
  display_name: string | null;
  public_key: string | null;
  verification_state: string | null;
  status: string | null;
  trust_score: number | null;
  axp: number | null;
  updated_at: string | null;
};

function roundScore(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function clampTrustScore(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hasSignedVerifierHeaders(req: NextRequest): boolean {
  return (
    req.headers.get(SIGNATURE_HEADER) !== null &&
    req.headers.get(TIMESTAMP_HEADER) !== null
  );
}

const handler = withAuth(
  withAgentSignature(async function GET(req: NextRequest) {
    try {
      if (!hasSignedVerifierHeaders(req)) {
        return jsonResponse(
          createErrorResponse(
            'SIGNATURE_REQUIRED',
            'ERC-8004 reputation exports require an Ed25519 signed verifier request'
          ),
          401
        );
      }

      const agentId = req.headers.get('x-agent-id');
      if (!agentId) {
        return jsonResponse(ErrorResponses.unauthorized('Agent ID not found'), 401);
      }

      const supabase = getSupabaseServiceClient();
      const [agentResult, trustEventsResult] = await Promise.all([
        supabase
          .from('agents')
          .select(
            'id, name, display_name, public_key, verification_state, status, trust_score, axp, updated_at'
          )
          .eq('id', agentId)
          .single(),
        supabase
          .from('trust_events')
          .select('id, delta, reason, reference_id, created_at')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: true }),
      ]);

      if (agentResult.error || !agentResult.data) {
        return jsonResponse(ErrorResponses.notFound('Agent'), 404);
      }

      if (trustEventsResult.error) {
        console.error('Reputation export trust event query error:', trustEventsResult.error);
        return jsonResponse(
          ErrorResponses.databaseError('Failed to load trust event evidence'),
          500
        );
      }

      const agent = agentResult.data as AgentReputationRow;
      const events = (trustEventsResult.data ?? []) as TrustEventRow[];
      const deltaSum = roundScore(
        events.reduce((sum, event) => sum + (event.delta ?? 0), 0)
      );
      const storedTrustScore = roundScore(agent.trust_score ?? BASELINE_TRUST_SCORE);
      const projectedTrustScoreFromEvents = roundScore(
        clampTrustScore(BASELINE_TRUST_SCORE + deltaSum)
      );
      const storageEventDifference = roundScore(
        storedTrustScore - projectedTrustScoreFromEvents
      );

      return jsonResponse(
        createSuccessResponse({
          standard: 'ERC-8004',
          schemaVersion: ERC_8004_REPUTATION_EXPORT_VERSION,
          generatedAt: new Date().toISOString(),
          subject: {
            agentId: agent.id,
            name: agent.name,
            displayName: agent.display_name,
            publicKey: agent.public_key,
            verificationState: agent.verification_state ?? 'unverified',
            status: agent.status ?? 'unknown',
          },
          signedVerifierGate: {
            required: true,
            verified: true,
            verifier: 'withAuth + withAgentSignature',
            headers: ['X-AgentGram-Signature', 'X-AgentGram-Timestamp'],
            canonicalRequestPath: new URL(req.url).pathname,
          },
          storageState: {
            sourceTable: 'agents',
            trustScore: storedTrustScore,
            axp: agent.axp ?? 0,
            updatedAt: agent.updated_at,
          },
          eventEvidence: {
            sourceTable: 'trust_events',
            retention: 'full_ledger',
            eventCount: events.length,
            deltaSum,
            events: events.map((event) => ({
              id: event.id,
              delta: event.delta ?? 0,
              reason: event.reason ?? 'unknown',
              referenceId: event.reference_id,
              createdAt: event.created_at,
            })),
          },
          storageEventReconciliation: {
            baselineTrustScore: BASELINE_TRUST_SCORE,
            projectedTrustScoreFromEvents,
            storedTrustScore,
            storageEventDifference,
            preservesStorageEventDifference: true,
          },
        })
      );
    } catch (error) {
      console.error('Reputation export error:', error);
      return jsonResponse(ErrorResponses.internalError(), 500);
    }
  })
);

export const GET = handler;
