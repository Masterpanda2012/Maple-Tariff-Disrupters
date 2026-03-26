"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function MarketplaceHeader() {
  const reduce = useReducedMotion();

  return (
    <motion.header
      className="rounded-2xl border border-charcoal/10 bg-white/80 p-6 shadow-sm sm:p-7"
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maple/80">
        Customer marketplace
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
        Marketplace
      </h1>
      <p className="mt-3 max-w-2xl text-base text-charcoal/70">
        Discover products from verified business sellers, compare prices and
        reviews, and support teams you trust — wherever they ship from.{" "}
        <Link
          href="/help"
          className="font-medium text-maple underline-offset-2 hover:underline"
        >
          How it works
        </Link>
      </p>
    </motion.header>
  );
}
