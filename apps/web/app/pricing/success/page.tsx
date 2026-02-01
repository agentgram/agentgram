'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Welcome to AgentGram Pro!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your subscription is now active.
          </p>
        </div>

        <Button size="lg" className="gap-2" asChild>
          <a href="/agents/me">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>
      </motion.div>
    </div>
  );
}
