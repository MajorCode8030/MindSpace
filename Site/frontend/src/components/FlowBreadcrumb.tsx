import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function FlowBreadcrumb({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fluxo de navegação" className="w-full text-xs text-white/60">
      <ol className="flex flex-wrap items-center justify-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-white/35" />}
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-white/90" : "text-white/60"}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
