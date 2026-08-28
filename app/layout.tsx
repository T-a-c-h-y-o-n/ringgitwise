import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RinggitWise - SGD to MYR: How much will they really receive?",
  description: "Compare the true cost of sending SGD to Malaysia. See net MYR received across providers including fees and FX spread. Estimated and indicative.",
  openGraph: {
    title: "RinggitWise - SGD to MYR Transfer Cost Calculator",
    description: "Enter SGD amount, see estimated net MYR across 3 providers. Fees + FX spread included.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
