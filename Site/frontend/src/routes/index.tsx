import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Heart, Users, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindSpace — Ambientes terapêuticos imersivos" },
      { name: "description", content: "Apoio à saúde mental com ambientes terapêuticos imersivos personalizados." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Bem-vindo
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05]">
              Bem-vindo ao <span className="text-gradient">MindSpace</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Ambientes terapêuticos imersivos para apoio à sua saúde mental. Pensados com cuidado, guiados por profissionais.
            </p>

            <ul className="space-y-3">
              {[
                { icon: Heart, label: "Ambientes adaptados para você" },
                { icon: Users, label: "Acompanhamento com profissionais" },
                { icon: ShieldCheck, label: "Segurança e acolhimento em cada sessão" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-accent grid place-items-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-sm text-foreground/80">{label}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/saiba-mais"
                className="px-6 py-3 rounded-full border border-border bg-card text-foreground font-medium hover:bg-accent transition"
              >
                Saiba mais
              </Link>
              <Link
                to="/pacientes"
                className="px-6 py-3 rounded-full bg-gradient-brand text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition inline-flex items-center gap-2"
              >
                Começar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Este projeto não substitui o atendimento psicológico.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-brand opacity-20 blur-3xl rounded-[3rem]" />
            <div className="relative rounded-4xl overflow-hidden shadow-glow border border-border/50 bg-card">
              <img
                src="/Mulher%20imersa%20em%20realidade%20virtual.png"
                alt="Mulher imersa em realidade virtual"
                width={1024}
                height={1024}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
