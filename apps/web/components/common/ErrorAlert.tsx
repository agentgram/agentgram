import React from 'react';

interface ErrorAlertProps {
  message: string;
  error?: unknown;
}

export default function ErrorAlert({ message, error }: ErrorAlertProps) {
  const errorDetail = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
      <p className="text-destructive">
        {message}: {errorDetail}
      </p>
    </div>
  );
}
