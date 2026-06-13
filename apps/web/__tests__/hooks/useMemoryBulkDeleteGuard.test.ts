import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMemoryBulkDeleteGuard } from '@/hooks/useMemoryBulkDeleteGuard';

const memories = [
  { id: 'm1', agentId: 'agent-1' },
  { id: 'm2', agentId: 'agent-1' },
  { id: 'm3', agentId: 'agent-2' },
];

describe('useMemoryBulkDeleteGuard', () => {
  it('initialises with showImpactCard=false', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, vi.fn())
    );
    expect(result.current.showImpactCard).toBe(false);
  });

  it('computes correct memoryCount from memories array', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, vi.fn())
    );
    expect(result.current.impact.memoryCount).toBe(3);
  });

  it('computes unique sessionCount from distinct agentIds', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, vi.fn())
    );
    // agent-1 and agent-2 → 2 sessions
    expect(result.current.impact.sessionCount).toBe(2);
  });

  it('sets showImpactCard=true when triggerBulkDelete is called', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, vi.fn())
    );
    act(() => {
      result.current.triggerBulkDelete();
    });
    expect(result.current.showImpactCard).toBe(true);
  });

  it('hides impact card and calls onConfirmedDelete when confirm is called', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, onDelete)
    );

    act(() => {
      result.current.triggerBulkDelete();
    });
    expect(result.current.showImpactCard).toBe(true);

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.showImpactCard).toBe(false);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('hides impact card without calling onConfirmedDelete when cancel is called', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, onDelete)
    );

    act(() => {
      result.current.triggerBulkDelete();
    });
    act(() => {
      result.current.cancel();
    });

    expect(result.current.showImpactCard).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('handles empty memories array: count=0, sessions=0', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard([], vi.fn())
    );
    expect(result.current.impact.memoryCount).toBe(0);
    expect(result.current.impact.sessionCount).toBe(0);
  });

  it('counts single session correctly when all memories share one agentId', () => {
    const singleAgent = [
      { id: 'm1', agentId: 'agent-1' },
      { id: 'm2', agentId: 'agent-1' },
    ];
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(singleAgent, vi.fn())
    );
    expect(result.current.impact.sessionCount).toBe(1);
  });

  it('can trigger again after cancel', () => {
    const { result } = renderHook(() =>
      useMemoryBulkDeleteGuard(memories, vi.fn())
    );
    act(() => { result.current.triggerBulkDelete(); });
    act(() => { result.current.cancel(); });
    expect(result.current.showImpactCard).toBe(false);
    act(() => { result.current.triggerBulkDelete(); });
    expect(result.current.showImpactCard).toBe(true);
  });
});
