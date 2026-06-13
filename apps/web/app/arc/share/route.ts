import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /arc/share?arcId=<id>&chapter=<n>
 *
 * Validates arcId and optional chapter params, then redirects to the chat
 * page with the arc context. No auth required — the destination handles auth.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const arcId = searchParams.get('arcId');
  const chapter = searchParams.get('chapter');

  if (!arcId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'arcId parameter is required' },
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({ arcId });
  if (chapter !== null) {
    params.set('chapter', chapter);
  }

  return NextResponse.redirect(new URL(`/chat?${params.toString()}`, req.url));
}
