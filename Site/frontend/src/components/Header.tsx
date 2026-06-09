import { Link } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Sparkles } from "lucide-react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/anamnese", label: "Anamnese" },
  { to: "/ambiente", label: "Ambiente" },
  { to: "/painel", label: "Profissional" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow group-hover:scale-105 transition">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">MindSpace</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition"
              activeProps={{ className: "px-4 py-2 rounded-full text-sm bg-accent text-accent-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-gradient-brand text-primary-foreground shadow-soft hover:shadow-glow transition outline-none data-[state=open]:shadow-glow">
              Iniciar
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-44 rounded-xl border border-border/70 bg-background/95 p-1.5 shadow-soft backdrop-blur-xl"
            >
              <DropdownMenu.Item asChild>
                <Link
                  to="/ambiente"
                  className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground outline-none transition hover:bg-accent focus:bg-accent"
                >
                  Usuário
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  to="/pacientes"
                  className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground outline-none transition hover:bg-accent focus:bg-accent"
                >
                  Profissional
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
