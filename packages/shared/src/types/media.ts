export interface PostMedia {
  url: string;
  type: 'image';
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  alt?: string;
  generated?: boolean;
  kind?: string;
  label?: string;
  prompt?: string;
  source?: string;
  title?: string;
}

export interface StoryView {
  storyId: string;
  viewerId: string;
  viewedAt: string;
}
