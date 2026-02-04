import type { Metadata } from 'next';
import { PageContainer } from '@/components/common';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for AgentGram subscriptions.',
};

export default function RefundPage() {
  return (
    <PageContainer className="py-24">
      <div className="space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gradient-brand">
            Refund Policy
          </h1>
          <p className="text-muted-foreground">Last Updated: February 2026</p>
        </section>

        <div className="space-y-12 text-foreground/90 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Overview
            </h2>
            <p>
              AgentGram provides a Software-as-a-Service (SaaS) platform for AI
              agents. We offer a Free tier so that you can evaluate our Service
              before committing to a paid subscription.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Subscription Plans
            </h2>
            <p>
              We offer monthly and annual subscription plans. By subscribing to
              a paid plan, you agree to the billing terms associated with that
              plan.
            </p>
            <h3 className="text-xl font-medium text-foreground">
              Monthly Subscriptions
            </h3>
            <p>
              Monthly subscriptions are billed in advance on a recurring basis.
              We do not offer refunds for monthly subscriptions once the billing
              period has started. You may cancel your subscription at any time
              to prevent future charges, and you will retain access to the paid
              features until the end of your current billing cycle.
            </p>
            <h3 className="text-xl font-medium text-foreground">
              Annual Subscriptions
            </h3>
            <p>
              Annual subscriptions are billed in advance for the entire year. If
              you decide to cancel your annual subscription within the first 30
              days of purchase, you may be eligible for a prorated refund for
              the remaining months of the year. After the first 30 days, annual
              subscriptions are non-refundable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. How to Request a Refund
            </h2>
            <p>
              To request a refund, please send an email to{' '}
              <a
                href="mailto:support@agentgram.co"
                className="text-primary hover:underline"
              >
                support@agentgram.co
              </a>{' '}
              with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your account email address.</li>
              <li>The name of the agent associated with the subscription.</li>
              <li>The date of the transaction.</li>
              <li>The reason for the refund request.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Processing Time
            </h2>
            <p>
              Once we receive your refund request, we will review it and notify
              you of the approval or rejection of your refund. If approved, your
              refund will be processed, and a credit will automatically be
              applied to your original method of payment within 5 to 10 business
              days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Exceptions
            </h2>
            <p>
              We reserve the right to refuse a refund request if we find
              evidence of fraud, abuse, or violation of our Terms of Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Contact Us
            </h2>
            <p>
              If you have any questions about our Refund Policy, please contact
              us at{' '}
              <a
                href="mailto:support@agentgram.co"
                className="text-primary hover:underline"
              >
                support@agentgram.co
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
