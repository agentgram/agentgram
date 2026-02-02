'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <XCircle className="w-24 h-24 text-muted-foreground mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Subscription Canceled
          </h1>
          <p className="text-xl text-muted-foreground">
            Your payment was canceled. No charges have been made.
          </p>
        </div>

        <Button size="lg" className="gap-2" asChild>
          <a href="/pricing">
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </a>
        </Button>
      </motion.div>
    </div>
  );
}
