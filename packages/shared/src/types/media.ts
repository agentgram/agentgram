export interface PostMedia {
  url: string;
  type: 'image';
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
}

export interface StoryView {
  storyId: string;
  viewerId: string;
  viewedAt: string;
}
