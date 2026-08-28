import { PROVIDERS, Provider } from "./providers";

export type CalculationInput = {
  amountSGD: number;
  referenceRate: number; // SGD->MYR mid-market / primary rate
};

export type ProviderResult = {
  provider: Provider;
  providerRate: number;
  feeSGD: number;
  netSGDForFX: number;
  netMYR: number;
  totalCostSGD: number; // fee + spread cost
  spreadCostSGD: number;
  spreadCostMYR: number;
};

export type CalculationResult = {
  amountSGD: number;
  referenceRate: number;
  referenceMYR: number; // amount * referenceRate (before any fee/spread)
  results: ProviderResult[];
  best: ProviderResult;
  worst: ProviderResult;
  maxDifferenceMYR: number;
};

export function validateAmount(raw: string): { valid: boolean; value?: number; error?: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: false, error: "Enter an amount" };
  // allow comma
  const normalized = trimmed.replace(/,/g, "");
  const n = Number(normalized);
  if (isNaN(n)) return { valid: false, error: "Enter a valid number" };
  if (!isFinite(n)) return { valid: false, error: "Enter a valid number" };
  if (n <= 0) return { valid: false, error: "Amount must be greater than 0" };
  if (n > 1_000_000) return { valid: false, error: "Max SGD 1,000,000 for estimate" };
  return { valid: true, value: n };
}

export function calculateFee(provider: Provider, amountSGD: number): number {
  return provider.feeFlatSGD + amountSGD * provider.feePercent;
}

export function calculate(input: CalculationInput): CalculationResult {
  const { amountSGD, referenceRate } = input;
  const referenceMYR = amountSGD * referenceRate;

  const results: ProviderResult[] = PROVIDERS.map((p) => {
    const feeSGD = calculateFee(p, amountSGD);
    const providerRate = referenceRate * (1 + p.spread);
    // net SGD that actually gets converted = amount - fee (fee taken from send amount for simplicity; matches Wise model)
    // If fee > amount, net is 0
    const netSGDForFX = Math.max(0, amountSGD - feeSGD);
    const netMYR = netSGDForFX * providerRate;
    // spread cost
    const spreadCostMYR = referenceMYR - netSGDForFX * referenceRate; // wait that's not right - need explicit
    // Simpler: spreadCost = amount * referenceRate - amount * providerRate = amount * (ref - providerRate) but fee excluded
    // We'll compute spread on the converted portion
    const spreadCostMYRCalc = netSGDForFX * referenceRate - netSGDForFX * providerRate;
    const spreadCostSGD = spreadCostMYRCalc / referenceRate;
    const totalCostSGD = feeSGD + spreadCostSGD;

    return {
      provider: p,
      providerRate,
      feeSGD,
      netSGDForFX,
      netMYR,
      totalCostSGD,
      spreadCostSGD,
      spreadCostMYR: spreadCostMYRCalc,
    };
  });

  // sort best = highest netMYR
  const sorted = [...results].sort((a, b) => b.netMYR - a.netMYR);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const maxDifferenceMYR = best.netMYR - worst.netMYR;

  return {
    amountSGD,
    referenceRate,
    referenceMYR,
    results: sorted,
    best,
    worst,
    maxDifferenceMYR,
  };
}
