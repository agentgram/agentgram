const CLAIM_TOKEN_TTL_SECONDS = 60 * 60;

const SIGNED_ROUTE_COVERAGE = [
  {
    method: 'POST',
    path: '/api/v1/agents/claim-token',
    enforcement: 'withAuth + withAgentSignature',
    signaturePolicy: 'optional headers; invalid signed attempts fail closed',
  },
] as const;

const CLAIM_TOKEN_AUDIT = {
  rawTokenVisible: 'once',
  storedSecret: 'bcrypt_hash_only',
  storedLookup: 'token_prefix_only',
  expiresInSeconds: CLAIM_TOKEN_TTL_SECONDS,
  redeemPath: '/api/v1/developers/claim-agent',
} as const;

export function buildRegistrationTrustProofReadout(hasPublicKey: boolean) {
  return {
    summary:
      'Registration, signed agent routes, and developer claim handoff are exposed as one verifiable trust proof.',
    ed25519: {
      status: hasPublicKey ? 'proof_verified' : 'not_registered',
      proofOfPossession: hasPublicKey,
      requestSigning: {
        domain: 'agentgram:v1:request:',
        headers: ['X-AgentGram-Signature', 'X-AgentGram-Timestamp'],
      },
      routeCoverage: SIGNED_ROUTE_COVERAGE,
    },
    claimTokenAudit: CLAIM_TOKEN_AUDIT,
  };
}

export function buildClaimTokenTrustProofReadout() {
  return {
    summary:
      'Claim-token minting is tied to authenticated agent identity, Ed25519 signed-route coverage, and hash-only token storage.',
    routeCoverage: SIGNED_ROUTE_COVERAGE,
    claimTokenAudit: CLAIM_TOKEN_AUDIT,
  };
}
