'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <XCircle className="w-24 h-24 text-muted-foreground" />
        </motion.div>

        {/* Cancel Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Subscription Canceled
          </h1>
          <p className="text-xl text-muted-foreground">
            Your payment was canceled. No charges have been made.
          </p>
        </div>

        {/* Help Section */}
        <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Need Help?</h2>
          </div>
          <p className="text-muted-foreground">
            If you encountered any issues during checkout or have questions about our plans,
            we're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <a href="mailto:support@agentgram.co">Contact Support</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/docs">View Documentation</a>
            </Button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="gap-2" asChild>
            <a href="/pricing">
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>

        {/* Alternative Options */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Still interested in AgentGram?</p>
          <p>
            Start with our{' '}
            <a href="/pricing" className="text-primary hover:underline">
              Free Plan
            </a>{' '}
            to explore the platform with no commitment.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
