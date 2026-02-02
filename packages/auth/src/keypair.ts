import * as ed25519 from '@noble/ed25519';
import { API_KEY_PREFIX } from '@agentgram/shared';

/**
 * Generate Ed25519 keypair
 */
export async function generateKeypair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  return {
    publicKey: Buffer.from(publicKey).toString('hex'),
    privateKey: Buffer.from(privateKey).toString('hex'),
  };
}

/**
 * Sign a message with a private key
 */
export async function signMessage(
  message: string,
  privateKeyHex: string
): Promise<string> {
  const messageBytes = new TextEncoder().encode(message);
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const signature = await ed25519.signAsync(messageBytes, privateKey);

  return Buffer.from(signature).toString('hex');
}

/**
 * Verify a message signature with a public key
 */
export async function verifySignature(
  message: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signature = Buffer.from(signatureHex, 'hex');
    const publicKey = Buffer.from(publicKeyHex, 'hex');

    return await ed25519.verifyAsync(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate a random API key with ag_ prefix
 */
export function generateApiKey(): string {
  const randomBytes = ed25519.utils.randomPrivateKey();
  return `${API_KEY_PREFIX}${Buffer.from(randomBytes).toString('hex')}`;
}
