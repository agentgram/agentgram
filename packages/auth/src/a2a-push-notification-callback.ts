import {
  canonicalJson,
  verifyA2aAgentCardSignature,
  type A2aAgentCardSignatureVerdict,
} from './ed25519';

export const A2A_PUSH_NOTIFICATION_CALLBACK_VERIFICATION_SIGNATURE_DOMAIN =
  'agentgram:v1:a2a-push-notification-callback-verification:';

export type A2aPushNotificationSubscriptionAction = 'create' | 'delete';

export interface A2aPushNotificationSubscriptionTransitionProbe {
  action: A2aPushNotificationSubscriptionAction;
  subscriptionId: string;
  callbackUrl: string;
  occurredAt: string | null;
}

export interface A2aPushNotificationCallbackVerificationReport {
  kind: 'agentgram.a2a.push-notification.callback-verification-receipt';
  generatedAt: string;
  signedAgentCardPayloadDigest: string;
  agentCardUrl: string;
  callbackUrl: string;
  callback: {
    https: true;
    ownershipPolicy: 'same-origin-agent-card-url';
    ownership: 'verified' | 'failed';
    reasons: string[];
  };
  subscription: {
    createObserved: boolean;
    deleteObserved: boolean;
    transitions: A2aPushNotificationSubscriptionTransitionProbe[];
    reasons: string[];
  };
  failedDelivery: {
    observed: boolean;
    subscriptionId: string | null;
    statusCode: number | null;
    errorDigest: string | null;
    reasons: string[];
  };
  receipt: {
    status: 'verified';
    signingAlgorithm: 'ed25519';
    signatureDomain: typeof A2A_PUSH_NOTIFICATION_CALLBACK_VERIFICATION_SIGNATURE_DOMAIN;
    publicKey: string;
    payloadDigest: string;
  };
}

export type A2aPushNotificationCallbackVerificationVerdict =
  | {
      ok: true;
      receipt: A2aPushNotificationCallbackVerificationReport;
      signature: Extract<A2aAgentCardSignatureVerdict, { ok: true }>;
    }
  | {
      ok: false;
      code:
        | 'SIGNATURE_INVALID'
        | 'PUSH_NOTIFICATIONS_NOT_CLAIMED'
        | 'CALLBACK_VERIFICATION_FAILED';
      message: string;
      receipt?: A2aPushNotificationCallbackVerificationReport;
      signature: A2aAgentCardSignatureVerdict;
    };

interface SubscriptionTransitionInput {
  action?: unknown;
  subscriptionId?: unknown;
  callbackUrl?: unknown;
  occurredAt?: unknown;
}

interface FailedDeliveryInput {
  subscriptionId?: unknown;
  callbackUrl?: unknown;
  status?: unknown;
  success?: unknown;
  statusCode?: unknown;
  error?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function readHttpsUrl(value: unknown): URL | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function readSubscriptionAction(
  value: unknown
): A2aPushNotificationSubscriptionAction | null {
  return value === 'create' || value === 'delete' ? value : null;
}

function readPushNotificationClaim(agentCard: Record<string, unknown>): boolean {
  const capabilities = agentCard.capabilities;
  return isRecord(capabilities) && capabilities.pushNotifications === true;
}

function normalizeSubscriptionTransitions(input: {
  callbackUrl: string;
  subscriptionTransitions?: unknown;
}) {
  const reasons: string[] = [];
  const transitions: A2aPushNotificationSubscriptionTransitionProbe[] = [];
  if (!Array.isArray(input.subscriptionTransitions)) {
    return {
      transitions,
      subscriptionId: null,
      createObserved: false,
      deleteObserved: false,
      reasons: ['subscriptionTransitions must be an array'],
    };
  }

  let subscriptionId: string | null = null;
  for (const [index, transition] of input.subscriptionTransitions.entries()) {
    const record = isRecord(transition)
      ? (transition as SubscriptionTransitionInput)
      : {};
    const action = readSubscriptionAction(record.action);
    const transitionSubscriptionId = readString(record.subscriptionId);
    const transitionCallbackUrl = readHttpsUrl(record.callbackUrl);
    const occurredAt = readDate(record.occurredAt);

    if (action === null) reasons.push(`transition[${index}] action must be create or delete`);
    if (transitionSubscriptionId === null) {
      reasons.push(`transition[${index}] subscriptionId is required`);
    } else if (subscriptionId === null) {
      subscriptionId = transitionSubscriptionId;
    } else if (subscriptionId !== transitionSubscriptionId) {
      reasons.push(`transition[${index}] subscriptionId does not match`);
    }
    if (transitionCallbackUrl === null) {
      reasons.push(`transition[${index}] callbackUrl must be HTTPS`);
    } else if (transitionCallbackUrl.toString() !== input.callbackUrl) {
      reasons.push(`transition[${index}] callbackUrl does not match`);
    }
    if (record.occurredAt !== undefined && occurredAt === null) {
      reasons.push(`transition[${index}] occurredAt must be an ISO timestamp`);
    }

    if (action !== null && transitionSubscriptionId !== null && transitionCallbackUrl !== null) {
      transitions.push({
        action,
        subscriptionId: transitionSubscriptionId,
        callbackUrl: transitionCallbackUrl.toString(),
        occurredAt: occurredAt === null ? null : occurredAt.toISOString(),
      });
    }
  }

  const createObserved = transitions.some((transition) => transition.action === 'create');
  const deleteObserved = transitions.some((transition) => transition.action === 'delete');
  if (!createObserved) reasons.push('create subscription transition was not observed');
  if (!deleteObserved) reasons.push('delete subscription transition was not observed');

  return { transitions, subscriptionId, createObserved, deleteObserved, reasons };
}

async function normalizeFailedDelivery(input: {
  callbackUrl: string;
  subscriptionId: string | null;
  failedDelivery?: unknown;
}) {
  const reasons: string[] = [];
  const record = isRecord(input.failedDelivery)
    ? (input.failedDelivery as FailedDeliveryInput)
    : null;
  if (record === null) {
    return {
      observed: false,
      subscriptionId: null,
      statusCode: null,
      errorDigest: null,
      reasons: ['failedDelivery outcome is required'],
    };
  }

  const subscriptionId = readString(record.subscriptionId);
  const callbackUrl = readHttpsUrl(record.callbackUrl);
  const statusCode = Number.isSafeInteger(record.statusCode)
    ? (record.statusCode as number)
    : null;
  const failed = record.status === 'failed' || record.success === false;
  const error = readString(record.error);

  if (!failed) reasons.push('failedDelivery must record status failed or success false');
  if (subscriptionId === null) {
    reasons.push('failedDelivery subscriptionId is required');
  } else if (input.subscriptionId !== null && subscriptionId !== input.subscriptionId) {
    reasons.push('failedDelivery subscriptionId does not match');
  }
  if (callbackUrl === null) {
    reasons.push('failedDelivery callbackUrl must be HTTPS');
  } else if (callbackUrl.toString() !== input.callbackUrl) {
    reasons.push('failedDelivery callbackUrl does not match');
  }
  if (statusCode !== null && (statusCode < 400 || statusCode > 599)) {
    reasons.push('failedDelivery statusCode must be an HTTP failure status');
  }
  if (statusCode === null && error === null) {
    reasons.push('failedDelivery requires statusCode or error evidence');
  }

  return {
    observed: reasons.length === 0,
    subscriptionId,
    statusCode,
    errorDigest: error === null ? null : await sha256Hex(error),
    reasons,
  };
}

export async function attestA2aPushNotificationCallbackVerification(input: {
  agentCard?: unknown;
  publicKey?: unknown;
  signature?: unknown;
  jws?: unknown;
  callbackUrl?: unknown;
  subscriptionTransitions?: unknown;
  failedDelivery?: unknown;
  now?: Date;
}): Promise<A2aPushNotificationCallbackVerificationVerdict> {
  const signature = await verifyA2aAgentCardSignature(input);
  if (!signature.ok) {
    return {
      ok: false,
      code: 'SIGNATURE_INVALID',
      message:
        'A2A push-notification callback verification requires a valid signed Agent Card',
      signature,
    };
  }

  if (!isRecord(input.agentCard) || !readPushNotificationClaim(input.agentCard)) {
    return {
      ok: false,
      code: 'PUSH_NOTIFICATIONS_NOT_CLAIMED',
      message:
        'A2A Agent Card must claim capabilities.pushNotifications before callback verification is trusted',
      signature,
    };
  }

  const agentCardUrl = readHttpsUrl(input.agentCard.url);
  const callbackUrl = readHttpsUrl(input.callbackUrl);
  if (agentCardUrl === null || callbackUrl === null) {
    return {
      ok: false,
      code: 'CALLBACK_VERIFICATION_FAILED',
      message:
        'A2A push-notification callback verification requires HTTPS agentCard.url and callbackUrl',
      signature,
    };
  }

  const callbackReasons: string[] = [];
  if (agentCardUrl.origin !== callbackUrl.origin) {
    callbackReasons.push('callbackUrl origin must match signed Agent Card url origin');
  }

  const subscription = normalizeSubscriptionTransitions({
    callbackUrl: callbackUrl.toString(),
    subscriptionTransitions: input.subscriptionTransitions,
  });
  const failedDelivery = await normalizeFailedDelivery({
    callbackUrl: callbackUrl.toString(),
    subscriptionId: subscription.subscriptionId,
    failedDelivery: input.failedDelivery,
  });
  const payload = {
    kind: 'agentgram.a2a.push-notification.callback-verification-payload',
    signedAgentCardPayloadDigest: signature.payloadDigest,
    agentCardUrl: agentCardUrl.toString(),
    callbackUrl: callbackUrl.toString(),
    subscriptionTransitions: subscription.transitions,
    failedDelivery: {
      observed: failedDelivery.observed,
      subscriptionId: failedDelivery.subscriptionId,
      statusCode: failedDelivery.statusCode,
      errorDigest: failedDelivery.errorDigest,
    },
  };
  const receipt: A2aPushNotificationCallbackVerificationReport = {
    kind: 'agentgram.a2a.push-notification.callback-verification-receipt',
    generatedAt: (input.now ?? new Date()).toISOString(),
    signedAgentCardPayloadDigest: signature.payloadDigest,
    agentCardUrl: agentCardUrl.toString(),
    callbackUrl: callbackUrl.toString(),
    callback: {
      https: true,
      ownershipPolicy: 'same-origin-agent-card-url',
      ownership: callbackReasons.length === 0 ? 'verified' : 'failed',
      reasons: callbackReasons,
    },
    subscription: {
      createObserved: subscription.createObserved,
      deleteObserved: subscription.deleteObserved,
      transitions: subscription.transitions,
      reasons: subscription.reasons,
    },
    failedDelivery,
    receipt: {
      status: 'verified',
      signingAlgorithm: 'ed25519',
      signatureDomain: A2A_PUSH_NOTIFICATION_CALLBACK_VERIFICATION_SIGNATURE_DOMAIN,
      publicKey: String(input.publicKey).toLowerCase(),
      payloadDigest: await sha256Hex(canonicalJson(payload)),
    },
  };
  const verificationReasons = [
    ...callbackReasons,
    ...subscription.reasons,
    ...failedDelivery.reasons,
  ];
  if (verificationReasons.length > 0) {
    return {
      ok: false,
      code: 'CALLBACK_VERIFICATION_FAILED',
      message:
        'A2A push-notification callback verification could not prove HTTPS ownership, subscription lifecycle, and failed delivery outcome',
      receipt,
      signature,
    };
  }

  return { ok: true, receipt, signature };
}
