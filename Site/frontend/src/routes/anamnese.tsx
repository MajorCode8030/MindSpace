import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/anamnese")({
  head: () => ({ meta: [{ title: "Anamnese — MindSpace" }] }),
  component: Anamnese,
});

function Anamnese() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-14">
        <section className="rounded-3xl border border-border/50 bg-card p-10 text-center shadow-card">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-accent grid place-items-center">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Anamnese integrada ao prontuario</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Para deixar o fluxo mais intuitivo, a anamnese agora faz parte da pagina de pacientes.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link to="/pacientes" className="px-6 py-2.5 rounded-full bg-gradient-brand text-primary-foreground text-sm font-medium">
              Ir para pacientes
            </Link>
            <Link to="/painel" className="px-6 py-2.5 rounded-full border border-border bg-card text-sm hover:bg-accent transition">
              Ir para painel
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
