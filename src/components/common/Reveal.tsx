import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const tags = { div: motion.div, li: motion.li, section: motion.section } as const;

/** Fades content up once as it enters the viewport. Transform/opacity only; disabled for reduced motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof tags;
}) {
  const reduce = useReducedMotion();
  const Tag = tags[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
