/**
 * Curated demo content and test fixture. This module is imported only by the
 * server-side assist route and automated tests, never by the client component.
 */
export const GOLD_ASSISTANT_DRAFT = {
  customerReply: `Hi Priya,

I’m sorry for the disruption and the concern caused by the duplicate-record signal. Our provider timeline confirms 75 eligible minutes of service unavailability on 3 August. The remaining 24 minutes occurred after provider recovery and were linked to customer DNS configuration, so they are excluded under SOP-SLA-1.3.

That gives 99.8264% monthly availability and a standard 10% service credit on the $49,500 monthly platform fee: $4,950, applied to the next invoice. Because you reported a possible data-integrity issue, the credit and incident response remain pending Security and Legal review. I have not applied or promised the credit yet.

We will provide the final decision and a data-integrity update within five business days.

Best,
Alex · Support Operations`,
  internalNote: `Account current; claim received 10 days after incident end. INC-240803 shows 75 provider-attributable minutes; exclude 24 post-recovery customer-DNS minutes. Availability 99.8264%. Eligible base $49,500 excludes the $8,000 implementation fee; standard next-invoice credit is 10% / $4,950. Possible duplicate records trigger mandatory Security + Legal review. Decision remains pending; route to SEC-LEGAL and update customer within five business days.`,
  checks: [
    "Recalculated from eligible minutes, not the customer’s 99-minute total",
    "Excluded the implementation line from the credit base",
    "Kept the commitment pending because data integrity requires human review",
  ],
  caution: "Do not speculate on root cause or tell the customer that the credit is approved.",
};
