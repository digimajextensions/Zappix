import { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { PricingComparison } from "@/components/marketing/pricing-comparison";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/animate-in";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for WhatsApp TV businesses. Start at N10,000/month with no hidden fees.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 py-section-sm lg:py-section">
        <div className="section-container text-center">
          <AnimateIn direction="up">
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-hero-sm">
              Simple, Honest Pricing
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 sm:text-lg">
              No hidden fees, no surprises. Pick a plan that fits your WhatsApp
              TV business and start growing today.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Pricing Cards */}
      <PricingCards />

      {/* Feature Comparison Table */}
      <AnimateIn direction="up" delay={0.1}>
        <section className="py-section-sm lg:py-section">
          <div className="section-container overflow-x-auto">
            <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
              Compare Plans
            </h2>
            <PricingComparison />
          </div>
        </section>
      </AnimateIn>

      {/* Pricing FAQ */}
      <section className="bg-gray-50 py-section-sm lg:py-section">
        <div className="section-container">
          <AnimateIn direction="up">
            <h2 className="mb-8 text-center text-2xl font-bold sm:mb-12 sm:text-3xl">
              Pricing FAQ
            </h2>
          </AnimateIn>
          <StaggerContainer className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, all plans come with a 7-day free trial. No credit card required to start.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all Nigerian bank cards, bank transfers, and USSD payments via Paystack.",
              },
              {
                q: "What is your refund policy?",
                a: "We offer a full refund within 7 days of your first payment. See our refund policy for details.",
              },
              {
                q: "Can I pay yearly?",
                a: "Yes! Save 17% when you pay annually. That is 2 months free.",
              },
            ].map((faq) => (
              <StaggerItem
                key={faq.q}
              >
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                  <h3 className="mb-2 text-sm font-semibold sm:text-base">{faq.q}</h3>
                  <p className="text-sm text-gray-500 sm:text-base">{faq.a}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Enterprise CTA */}
      <AnimateIn direction="up">
        <section className="py-section-sm lg:py-section">
          <div className="section-container text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Need a custom plan?</h2>
            <p className="mx-auto mb-8 max-w-xl text-sm text-gray-500 sm:text-base">
              Running an agency or managing more than 15 accounts? Let us talk
              about a custom plan that fits your needs.
            </p>
            <a
              href="mailto:hello@zappix.ng"
              className="btn-gradient text-base sm:text-lg"
            >
              Contact Sales
            </a>
          </div>
        </section>
      </AnimateIn>
    </>
  );
}
