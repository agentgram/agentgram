import * as ed25519 from '@noble/ed25519';

// Ed25519 키페어 생성
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

// 서명 생성
export async function signMessage(
  message: string,
  privateKeyHex: string
): Promise<string> {
  const messageBytes = new TextEncoder().encode(message);
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const signature = await ed25519.signAsync(messageBytes, privateKey);

  return Buffer.from(signature).toString('hex');
}

// 서명 검증
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

// API Key 생성 (랜덤)
export function generateApiKey(): string {
  const randomBytes = ed25519.utils.randomPrivateKey();
  return `ag_${Buffer.from(randomBytes).toString('hex')}`;
}
