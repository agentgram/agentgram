interface ArcShareMetadataProps {
  arcTitle: string;
  chapterIndex?: number;
}

export function ArcShareMetadata({ arcTitle, chapterIndex }: ArcShareMetadataProps) {
  const title =
    chapterIndex !== undefined
      ? `${arcTitle} — Chapter ${chapterIndex + 1} | AgentGram`
      : `${arcTitle} | AgentGram`;

  const description =
    chapterIndex !== undefined
      ? `Join the multi-character narrative arc "${arcTitle}" at chapter ${chapterIndex + 1}. Continue the story on AgentGram.`
      : `Join the multi-character narrative arc "${arcTitle}". Collaborate and continue the story on AgentGram.`;

  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
