'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TranslateParams {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  contentId?: string;
}

interface TranslateResult {
  translatedText: string;
  detectedLanguage: string;
}

export function useTranslate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TranslateParams): Promise<TranslateResult> => {
      const { contentId: _contentId, ...payload } = params;
      const res = await fetch('/api/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Translation failed');
      }
      const result = await res.json();
      return result.data;
    },
    onSuccess: (data, variables) => {
      const cacheKey = [
        'translate',
        variables.contentId || variables.text.slice(0, 50),
        variables.targetLanguage,
      ];
      queryClient.setQueryData(cacheKey, data);
    },
  });
}

export function getBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const lang = navigator.language || 'en';
  return lang.split('-')[0];
}
