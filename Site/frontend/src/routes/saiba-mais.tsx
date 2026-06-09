import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/saiba-mais")({
  head: () => ({
    meta: [
      { title: "Saiba mais — MindSpace" },
      {
        name: "description",
        content:
          "Conheça o contexto, propósito social e impacto do projeto MindSpace no cuidado em saúde mental.",
      },
    ],
  }),
  component: SaibaMais,
});

function SaibaMais() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10 lg:py-14">
        <div className="rounded-3xl border border-border/50 bg-card p-7 lg:p-10 shadow-card">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <h1 className="mt-6 text-3xl lg:text-4xl font-bold leading-tight">
            Sobre o MindSpace
          </h1>

          <div className="mt-6 space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              O MindSpace e um MVP desenvolvido durante um hackathon promovido pelo
              Ministerio da Ciencia, Tecnologia e Inovacoes do Governo Federal,
              tendo como instituicao executora o iRede. Dentro das trilhas propostas
              pelo programa, escolhemos explorar o potencial do Metaverso e das
              tecnologias imersivas aplicadas a saude mental.
            </p>

            <p>
              Nosso projeto nasce da necessidade urgente de ampliar o acesso ao
              cuidado psicologico e emocional no Brasil, principalmente diante do
              crescimento alarmante dos casos relacionados a saude mental.
              Atualmente, transtornos como ansiedade, depressao, burnout e
              sobrecarga emocional ja figuram entre as maiores causas de
              incapacidade e afastamento do trabalho no pais.
            </p>

            <p>
              Somente em 2024, mais de 440 mil afastamentos relacionados a saude
              mental foram registrados no Brasil. Em 2025, esse numero ultrapassou
              540 mil beneficios concedidos por transtornos mentais e
              comportamentais, evidenciando uma crise crescente que impacta milhoes
              de pessoas, familias e profissionais.
            </p>

            <p>
              Diante desse cenario, o MindSpace propoe utilizar ambientes imersivos
              e terapeuticos em XR/Metaverso como ferramenta complementar ao
              trabalho de profissionais da saude mental. A plataforma busca permitir
              atendimentos remotos mais humanizados, acessiveis e emocionalmente
              acolhedores, especialmente para regioes remotas, populacoes
              vulneraveis e unidades publicas de atendimento psicossocial, como os
              CAPS.
            </p>

            <p>
              Atraves de tecnologias como realidade virtual, ambientes adaptativos e
              experiencias sensoriais personalizadas, nossa proposta e transformar a
              tecnologia em um instrumento de acolhimento, inclusao e ampliacao do
              cuidado humano.
            </p>

            <p className="font-semibold text-foreground">
              Mais do que inovacao tecnologica, acreditamos em inovacao com
              proposito social.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
