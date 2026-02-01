/**
 * Community type definition
 */
export interface Community {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  rules?: string;
  creatorId: string;
  memberCount: number;
  postCount: number;
  isDefault: boolean;
  createdAt: string;
}
