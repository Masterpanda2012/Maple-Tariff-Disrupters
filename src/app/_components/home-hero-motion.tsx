"use client";

import { motion, useReducedMotion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const shellClass =
  "relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28";

export function HomeHeroMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={shellClass}>{children}</div>;
  }

  return (
    <motion.div
      className={shellClass}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function HomeHeroItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={childVariants}>
      {children}
    </motion.div>
  );
}

export function HomeHeroButtons({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}
      >
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}
      variants={childVariants}
    >
      {children}
    </motion.div>
  );
}
