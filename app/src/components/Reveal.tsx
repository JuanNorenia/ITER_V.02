import { type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Envoltorio de revelado. Las clases rv / rv-line / rv-cut viven en index.css.
 * `variant="line"` espera un único hijo de texto (o un span) para el
 * ensamblaje vertical con recorte.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: "up" | "line" | "cut";
  delay?: number;
  className?: string;
  as?: "div" | "span" | "p" | "h2" | "h3" | "li";
}) {
  const ref = useInView<HTMLDivElement>();
  const cls =
    variant === "line" ? "rv-line" : variant === "cut" ? "rv-cut" : "rv";
  return (
    <Tag
      ref={ref as never}
      className={`${cls} ${className}`}
      style={{ ["--d" as string]: `${delay}ms` }}
    >
      {variant === "line" ? <span>{children}</span> : children}
    </Tag>
  );
}
