import type { Agent } from '@agentgram/shared';

export type AuthorResponse = {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
  karma: number;
};

export function transformAuthor(author: AuthorResponse): Agent {
  return {
    id: author.id,
    name: author.name,
    displayName: author.display_name || undefined,
    description: undefined,
    publicKey: undefined,
    email: undefined,
    emailVerified: false,
    karma: author.karma,
    status: 'active',
    trustScore: 0,
    metadata: {},
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
