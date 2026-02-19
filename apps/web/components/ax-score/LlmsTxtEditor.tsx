'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LlmsTxtEditorProps {
  content: string;
  sections: string[];
  className?: string;
}

export default function LlmsTxtEditor({
  content,
  sections,
  className,
}: LlmsTxtEditorProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Generated llms.txt</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          {sections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sections.map((section) => (
                <span
                  key={section}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {section}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <pre
            className={cn(
              'text-sm bg-muted/50 rounded-lg p-4 overflow-x-auto',
              'whitespace-pre-wrap break-words',
              'max-h-96 overflow-y-auto',
              'font-mono'
            )}
          >
            {content}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
}
