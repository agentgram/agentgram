import { describe, expect, it } from 'vitest';
import { detectCrisisKeywords } from '../../lib/crisis-detection';

describe('detectCrisisKeywords', () => {
  it('returns false for ordinary text', () => {
    expect(detectCrisisKeywords('Hello, how are you?')).toBe(false);
    expect(detectCrisisKeywords('I need help with my project')).toBe(false);
    expect(detectCrisisKeywords('')).toBe(false);
  });

  it('does not trigger on standalone "crisis" to avoid false positives', () => {
    expect(detectCrisisKeywords('climate crisis is a major issue')).toBe(false);
    expect(detectCrisisKeywords('financial crisis analysis')).toBe(false);
    expect(detectCrisisKeywords('management crisis at the company')).toBe(false);
    expect(detectCrisisKeywords('mission crisis response')).toBe(false);
  });

  it('detects specific crisis phrases', () => {
    expect(detectCrisisKeywords('I am in a mental health crisis')).toBe(true);
    expect(detectCrisisKeywords('I feel like I am in a crisis mentally')).toBe(true);
    expect(detectCrisisKeywords('having a crisis right now, need help')).toBe(true);
    expect(detectCrisisKeywords('I am in a crisis and do not know what to do')).toBe(true);
  });

  it('detects "suicide" in text', () => {
    expect(detectCrisisKeywords('I am thinking about suicide')).toBe(true);
  });

  it('detects "suicidal" in text', () => {
    expect(detectCrisisKeywords('I feel suicidal lately')).toBe(true);
  });

  it('detects "kill myself" in text', () => {
    expect(detectCrisisKeywords('I want to kill myself')).toBe(true);
  });

  it('detects "end my life" in text', () => {
    expect(detectCrisisKeywords('I want to end my life')).toBe(true);
  });

  it('detects "hurt myself" in text', () => {
    expect(detectCrisisKeywords('I keep wanting to hurt myself')).toBe(true);
  });

  it('detects "self-harm" in text', () => {
    expect(detectCrisisKeywords('I have been doing self-harm')).toBe(true);
  });

  it('detects "self harm" without hyphen', () => {
    expect(detectCrisisKeywords('thoughts of self harm')).toBe(true);
  });

  it('detects "hopeless" in text', () => {
    expect(detectCrisisKeywords('I feel completely hopeless')).toBe(true);
  });

  it('detects "want to die" in text', () => {
    expect(detectCrisisKeywords('I just want to die')).toBe(true);
  });

  it('detects "no reason to live" in text', () => {
    expect(detectCrisisKeywords('There is no reason to live anymore')).toBe(true);
  });

  it("detects \"don't want to live\" in text", () => {
    expect(detectCrisisKeywords("I don't want to live")).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(detectCrisisKeywords('I Feel SUICIDAL')).toBe(true);
    expect(detectCrisisKeywords('KILL MYSELF')).toBe(true);
  });

  it('detects keyword embedded in a longer sentence', () => {
    expect(
      detectCrisisKeywords(
        'Sometimes I find myself wondering if there is no reason to live for me'
      )
    ).toBe(true);
  });
});
