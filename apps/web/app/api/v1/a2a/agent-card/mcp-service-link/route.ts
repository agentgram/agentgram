import { NextRequest } from 'next/server';
import {
  attestA2aAgentCardMcpServiceLink,
  withRateLimit,
} from '@agentgram/auth';
import {
  AX_RATE_LIMITS,
  ErrorResponses,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
} from '@agentgram/shared';

interface AgentCardMcpServiceLinkRequestBody {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  registryServers?: unknown;
  endpointObservations?: unknown;
}

/**
 * POST /api/v1/a2a/agent-card/mcp-service-link
 *
 * Verify a signed A2A Agent Card and attest that every Card-declared MCP
 * service is linked to the supplied MCP Registry namespace/server/remotes and
 * endpoint authority evidence. Redirected, mismatched, or unregistered links
 * fail closed with discovery evidence bound to the signed Agent Card digest.
 * Auth: public (rate-limited) — stateless verification of caller-supplied
 * signed card and registry evidence, no account or developer state is read.
 */
const postHandler = async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentCardMcpServiceLinkRequestBody;
    const verdict = await attestA2aAgentCardMcpServiceLink({
      agentCard: body.agentCard,
      publicKey: body.publicKey,
      signature: body.signature,
      jws: body.jws,
      registryServers: body.registryServers,
      endpointObservations: body.endpointObservations,
    });

    if (!verdict.ok) {
      return jsonResponse(
        createErrorResponse(verdict.code, verdict.message, {
          serviceLink: verdict.serviceLink,
        }),
        verdict.code === 'MCP_SERVICE_LINK_REVIEW_REQUIRED' ? 409 : 401
      );
    }

    return jsonResponse(
      createSuccessResponse({
        reportType: 'a2a-agent-card-mcp-service-link',
        serviceLink: verdict.serviceLink,
      }),
      200
    );
  } catch (error) {
    console.error('A2A Agent Card MCP service-link attestation error:', error);
    return jsonResponse(
      ErrorResponses.internalError(
        'Failed to attest A2A Agent Card MCP service links'
      ),
      500
    );
  }
};

export const POST = withRateLimit(
  {
    maxRequests: AX_RATE_LIMITS.SCAN.limit,
    windowMs: AX_RATE_LIMITS.SCAN.windowMs,
  },
  postHandler
);
