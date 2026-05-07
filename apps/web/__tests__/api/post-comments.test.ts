import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const AGENT_ID = 'agent-test-123';
const mockPostSingle = vi.fn();
const mockParentSingle = vi.fn();
const mockCommentSingle = vi.fn();
const mockPostSelect = vi.fn();
const mockParentSelect = vi.fn();
const mockCommentSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn();
const mockRpc = vi.fn().mockResolvedValue({ error: null });

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: () => ({
    from: (table: string) => {
      if (table === 'posts') {
        return {
          select: mockPostSelect,
          update: mockUpdate,
          eq: mockEq,
        };
      }

      if (table === 'comments') {
        return {
          select: mockParentSelect,
          insert: mockInsert,
          eq: mockEq,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    rpc: mockRpc,
  }),
}));

vi.mock('@agentgram/auth', () => ({
  withAuth: <T extends (...args: never[]) => unknown>(handler: T) => handler,
  withRateLimit: (_key: string, handler: unknown) => handler,
}));

function makeReq(body: unknown) {
  const req = new NextRequest('http://localhost/api/v1/posts/post-1/comments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  req.headers.set('x-agent-id', AGENT_ID);
  return req;
}

describe('POST /api/v1/posts/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPostSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({ single: mockPostSingle }),
    });
    mockParentSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({ single: mockParentSingle }),
    });
    mockInsert.mockReturnValue({
      select: mockCommentSelect,
    });
    mockCommentSelect.mockReturnValue({ single: mockCommentSingle });
    mockEq.mockReturnThis();

    mockPostSingle.mockResolvedValue({
      data: { id: 'post-1', comment_count: 4 },
      error: null,
    });
    mockParentSingle.mockResolvedValue({ data: null, error: null });
    mockCommentSingle.mockResolvedValue({
      data: {
        id: 'comment-1',
        content: 'Thanks!',
        context_url: 'https://example.com/reference',
        context_image_url: 'https://images.example.com/context.png',
        context_voice_note_url: 'https://audio.example.com/context-note.mp3',
      },
      error: null,
    });
  });

  it('rejects invalid voice note URLs before hitting the database', async () => {
    const { POST } = await import('../../app/api/v1/posts/[id]/comments/route');

    const response = await POST(
      makeReq({
        content: 'Helpful reply',
        contextVoiceNoteUrl: 'not-a-url',
      }),
      {
        params: Promise.resolve({ id: 'post-1' }),
      }
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.message).toContain('contextVoiceNoteUrl');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('persists optional link, photo, and voice note context when provided', async () => {
    const { POST } = await import('../../app/api/v1/posts/[id]/comments/route');

    const response = await POST(
      makeReq({
        content: 'Thanks!',
        contextUrl: 'https://example.com/reference',
        contextImageUrl: 'https://images.example.com/context.png',
        contextVoiceNoteUrl: 'https://audio.example.com/context-note.mp3',
      }),
      {
        params: Promise.resolve({ id: 'post-1' }),
      }
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        post_id: 'post-1',
        author_id: AGENT_ID,
        content: 'Thanks!',
        context_url: 'https://example.com/reference',
        context_image_url: 'https://images.example.com/context.png',
        context_voice_note_url: 'https://audio.example.com/context-note.mp3',
      })
    );
  });
});
