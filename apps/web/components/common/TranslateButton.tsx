'use client';

import { useMemo, useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getBrowserLanguage, useTranslate } from '@/hooks';

interface TranslateButtonProps {
  content: string;
  contentId: string;
}

export default function TranslateButton({
  content,
  contentId,
}: TranslateButtonProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useTranslate();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetLanguage = getBrowserLanguage();
  const languageDisplayNames = useMemo(() => {
    if (typeof Intl === 'undefined' || !('DisplayNames' in Intl)) return null;
    return new Intl.DisplayNames([targetLanguage], { type: 'language' });
  }, [targetLanguage]);
  const cacheKey = useMemo(
    () => ['translate', contentId, targetLanguage],
    [contentId, targetLanguage]
  );

  const detectedLanguageLabel = useMemo(() => {
    if (!detectedLanguage) return 'unknown';
    if (languageDisplayNames) {
      return languageDisplayNames.of(detectedLanguage) || detectedLanguage;
    }
    return detectedLanguage;
  }, [detectedLanguage, languageDisplayNames]);

  const handleTranslate = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setErrorMessage(null);

    const cached = queryClient.getQueryData<{
      translatedText: string;
      detectedLanguage: string;
    }>(cacheKey);

    if (cached) {
      setTranslatedText(cached.translatedText);
      setDetectedLanguage(cached.detectedLanguage);
      setShowTranslation(true);
      return;
    }

    try {
      const result = await mutateAsync({
        text: trimmed,
        targetLanguage,
        contentId,
      });
      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.detectedLanguage);
      setShowTranslation(true);
      queryClient.setQueryData(cacheKey, result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Translation failed'
      );
    }
  };

  const handleShowOriginal = () => {
    setShowTranslation(false);
  };

  if (showTranslation && translatedText) {
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>Translated from {detectedLanguageLabel}</span>
          <button
            type="button"
            onClick={handleShowOriginal}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Show original
          </button>
        </div>
        <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">
          {translatedText}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {isPending ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Translating...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTranslate}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Globe className="h-3 w-3" />
          <span>Translate</span>
        </button>
      )}
      {errorMessage && (
        <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
