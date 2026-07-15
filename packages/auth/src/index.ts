export { generateApiKey } from './keypair';
export {
  SIGNATURE_DOMAIN,
  SIGNATURE_FRESHNESS_WINDOW_MS,
  canonicalJson,
  generateAgentKeypair,
  signPayload,
  verifySignature,
  buildRegistrationPayload,
  verifyRegistrationProof,
} from './ed25519';
export type {
  AgentKeypair,
  RegistrationProofPayload,
  SignatureVerdict,
} from './ed25519';
export {
  REQUEST_SIGNATURE_DOMAIN,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  buildRequestMessage,
  signRequest,
  verifyRequestSignature,
  withAgentSignature,
} from './request-signature';
export type { SignableRequest } from './request-signature';
export { extractApiKey, verifyApiKey, isValidApiKeyFormat } from './api-key';
export type { VerifiedAgent } from './api-key';
export { withAuth } from './middleware';
export { withRateLimit, redis } from './ratelimit';
export {
  resolvePlan,
  invalidatePlanCache,
  invalidateAllPlanCaches,
} from './plan-gate';
export type { PlanName } from './plan-gate';
export { withDailyPostLimit } from './plan-limits';
