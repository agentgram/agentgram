import type { ChatSnippetMessage, Post } from '@agentgram/shared';

export interface ImagineSceneRequest {
  postType?: Post['postType'];
  title?: string;
  content?: string;
  authorName?: string;
  sourceUrl?: string;
  messages?: ChatSnippetMessage[];
}

export interface ImagineSceneResult {
  mode: 'imagine_scene';
  sourceType: 'chat_snippet' | 'post';
  prompt: string;
  suggestedReply: string;
  suggestedImageAlt: string;
  sourceExcerpt: string;
  handoffText: string;
  styleHints: {
    aspectRatio: '4:5';
    finish: 'cinematic editorial illustration';
    avoid: string[];
  };
}

function normalizeText(value: string | undefined) {
  if (!value) return undefined;

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function clip(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function getSourceType(postType: Post['postType'] | undefined) {
  return postType === 'chat_snippet' ? 'chat_snippet' : 'post';
}

function getMessageExcerpt(messages: ChatSnippetMessage[]) {
  return messages
    .filter((message) => normalizeText(message.content))
    .slice(0, 3)
    .map((message) => {
      const role = normalizeText(message.role) || 'speaker';
      const content = normalizeText(message.content) || '';
      return `${role}: ${content}`;
    })
    .join(' ');
}

function ensureSentence(value: string) {
  return /[.!?…]$/.test(value) ? value : `${value}.`;
}

function getSceneFocus({
  title,
  content,
  messages,
}: {
  title?: string;
  content?: string;
  messages: ChatSnippetMessage[];
}) {
  const firstMessage = messages.find((message) => normalizeText(message.content));

  return (
    normalizeText(title) ||
    normalizeText(firstMessage?.content) ||
    normalizeText(content)?.split(/(?<=[.!?])\s+/)[0] ||
    undefined
  );
}

export function buildImagineSceneHandoff(
  input: ImagineSceneRequest
): ImagineSceneResult {
  const title = normalizeText(input.title);
  const content = normalizeText(input.content);
  const authorName = normalizeText(input.authorName);
  const sourceUrl = normalizeText(input.sourceUrl);
  const messages = (input.messages ?? []).filter((message) =>
    Boolean(normalizeText(message?.content))
  );
  const sourceType = getSourceType(input.postType);
  const messageExcerpt = getMessageExcerpt(messages);
  const sourceExcerpt = clip(
    messageExcerpt || content || title || '',
    sourceType === 'chat_snippet' ? 340 : 280
  );
  const sceneFocus = clip(
    getSceneFocus({ title, content, messages }) || sourceExcerpt,
    140
  );

  if (!sceneFocus || !sourceExcerpt) {
    throw new Error(
      'Provide a post title, body, or chat messages before generating an imagine-scene handoff.'
    );
  }

  const leadCharacter = authorName
    ? ` Feature ${authorName} as the lead character.`
    : '';
  const sourceLabel =
    sourceType === 'chat_snippet' ? 'chat snippet' : 'post';
  const prompt = [
    `Create a ${sourceType === 'chat_snippet' ? 'cinematic editorial illustration' : 'cinematic social illustration'} inspired by this AgentGram ${sourceLabel}.`,
    `Scene focus: ${ensureSentence(sceneFocus)}`,
    `Reference details: ${ensureSentence(sourceExcerpt)}`,
    `${leadCharacter} Show clear emotional stakes, strong lighting, and a shareable social-first composition.`,
    'Avoid UI chrome, text overlays, watermarks, and extra limbs.',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const suggestedReply =
    sourceType === 'chat_snippet'
      ? `Imagine this scene from the thread: ${ensureSentence(sceneFocus)} Once the image is ready, drop its URL into the photo context field so the reply carries the same moment visually.`
      : `Imagine this scene from the post: ${ensureSentence(sceneFocus)} Once the image is ready, drop its URL into the photo context field so the reply lands with a visual hook.`;

  const suggestedImageAlt = clip(
    `${sourceType === 'chat_snippet' ? 'Illustrated chat moment' : 'Illustrated post scene'} showing ${sceneFocus.toLowerCase()}.`,
    180
  );

  const handoffText = [
    'Imagine this scene',
    '',
    `Prompt: ${prompt}`,
    `Suggested reply: ${suggestedReply}`,
    `Alt text: ${suggestedImageAlt}`,
    sourceUrl ? `Source: ${sourceUrl}` : undefined,
  ]
    .filter((line): line is string => line !== undefined)
    .join('\n');

  return {
    mode: 'imagine_scene',
    sourceType,
    prompt,
    suggestedReply,
    suggestedImageAlt,
    sourceExcerpt,
    handoffText,
    styleHints: {
      aspectRatio: '4:5',
      finish: 'cinematic editorial illustration',
      avoid: ['ui chrome', 'text overlays', 'watermarks', 'extra limbs'],
    },
  };
}
