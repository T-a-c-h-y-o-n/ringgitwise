export type Provider = {
  id: string;
  name: string;
  // fee model: flat SGD + percent of amount
  feeFlatSGD: number;
  feePercent: number; // e.g. 0.005 = 0.5%
  // rate spread vs reference rate (negative means worse than mid-market)
  // e.g. -0.015 = -1.5% spread
  spread: number;
  // display metadata
  speed: string;
  ctaLabel: string;
  ctaUrl: string; // affiliate placeholder
  badge?: string;
  bestFor?: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    feeFlatSGD: 2.5,
    feePercent: 0.0043,
    spread: -0.003, // ~0.3% spread - closest to mid-market
    speed: "1-2 business days",
    ctaLabel: "Check rate",
    ctaUrl: "https://wise.com/gb/compare/sgd-to-myr-rate?amount=AMOUNT",
    badge: "Low fee",
    bestFor: "Best for most transfers",
  },
  {
    id: "instarem",
    name: "Instarem",
    feeFlatSGD: 0,
    feePercent: 0.0035,
    spread: -0.008, // 0.8%
    speed: "Same day",
    ctaLabel: "Check rate",
    ctaUrl: "https://www.instarem.com/en_SG/?from=SGD&to=MYR&amount=AMOUNT",
    bestFor: "Fast delivery",
  },
  {
    id: "dbs",
    name: "DBS / Bank",
    feeFlatSGD: 10,
    feePercent: 0.0,
    spread: -0.025, // 2.5% typical bank spread
    speed: "1-3 business days",
    ctaLabel: "Check rate",
    ctaUrl: "#",
    badge: "Bank reference",
    bestFor: "If you prefer your bank",
  },
];
