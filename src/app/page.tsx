import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import {
  BannerAlerta,
  BannerContato,
  BannerEvento,
} from "@/components/public/home-banners";
import { Heart, Users, Flame, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const usuario = await getCurrentUser();

  // Buscar configurações gerais
  const config = await prisma.configuracaoGeral.findFirst({
    where: { id: 1 },
  });

  const coordenadorNome = config?.coordenadorNome || "Brunão";
  const coordenadorFoto = config?.coordenadorFotoUrl || "/assets/coordenador.jpg";
  const coordenadorWhatsapp = config?.coordenadorWhatsapp || "5545999068852";
  const coordenadorMensagem =
    config?.coordenadorMensagem ||
    "Oii, vim pelo site e queria saber mais sobre o JUSCÃO";

  const secretarioNome = config?.secretarioNome || "Foletto";
  const secretarioFoto = config?.secretarioFotoUrl || "/assets/secretario.jpg";
  const secretarioWhatsapp = config?.secretarioWhatsapp || "5545991179727";
  const secretarioMensagem =
    config?.secretarioMensagem ||
    "Oii, vim pelo site e queria marcar um encontro no JUSC";

  const endereco =
    config?.enderecoPadrao ||
    "Salinha do JUSC — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra, Foz do Iguaçu - PR)";
  const horario = config?.horarioPadrao || "Domingos às 17h";
  const linkMaps =
    config?.linkGoogleMaps ||
    "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR";
  const instagram =
    config?.instagramUrl ||
    "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==";

  // Buscar banners ativos e NÃO expirados (validação obrigatória no backend)
  const agora = new Date();

  const alertaAtivo = await prisma.banner.findFirst({
    where: {
      tipo: "ALERTA",
      ativo: true,
      dataExpiracao: { gt: agora },
    },
    orderBy: { criadoEm: "desc" },
  });

  const eventosAtivos = await prisma.banner.findMany({
    where: {
      tipo: "EVENTO",
      ativo: true,
      dataExpiracao: { gt: agora },
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100 transition-colors">
      <PublicHeader estaLogado={!!usuario} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 honeycomb-pattern">
        {/* 1. Banner de Alerta Vermelho (Prioridade máxima, se ativo) */}
        {alertaAtivo && (
          <section aria-label="Avisos Urgentes" className="animate-fadeIn">
            <BannerAlerta
              titulo={alertaAtivo.titulo}
              resumo={alertaAtivo.resumo}
              descricaoCompleta={alertaAtivo.descricaoCompleta}
              whatsappCoordenador={coordenadorWhatsapp}
            />
          </section>
        )}

        {/* 2. Hero / Boas-vindas com Mascote Abelhudo transparente */}
        <section className="text-center bg-white dark:bg-[#13151c] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
          {/* Fundo decorativo sutil */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FFC72C]/15 dark:bg-[#FFC72C]/10 rounded-full blur-3xl -z-10" />

          {/* Mascote Abelhudo com fundo transparente */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-3 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/assets/abelhudo.png"
              alt="Mascote Abelhudo do JUSC"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] text-xs font-black uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Paróquia Menino Jesus
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
            JUSC
          </h1>
          <p className="text-sm font-black text-amber-600 dark:text-[#FFC72C] tracking-wider uppercase mt-0.5">
            Jovens Unidos Seguindo Cristo
          </p>

          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 max-w-md mx-auto leading-relaxed font-medium">
            Venha fazer parte da nossa colmeia! Um grupo jovem de oração, amizade verdadeira, música e missão.
          </p>

          {/* Card rápido de Encontro: Na Salinha do JUSC */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-[#1c1a13] border border-amber-200 dark:border-amber-900/60 text-xs font-bold text-neutral-800 dark:text-amber-200 shadow-sm">
            <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-[#FFC72C]" />
            <span>{horario} • Na Salinha do JUSC</span>
          </div>
        </section>

        {/* 3 & 4. Banners Grandes e Amarelos com Efeito 3D: Coordenador (Direita) e Secretário (Esquerda) */}
        <section aria-label="Coordenação do Grupo" className="space-y-6 sm:space-y-8 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFC72C]" />
              Fale Conosco no WhatsApp
            </h2>
            <span className="text-[11px] font-bold text-amber-600 dark:text-[#FFC72C]">
              Gestão Ativa
            </span>
          </div>

          {/* Banner Coordenador: Foto à Direita */}
          <BannerContato
            cargo="Coordenador"
            nome={coordenadorNome}
            fotoUrl={coordenadorFoto}
            whatsapp={coordenadorWhatsapp}
            mensagem={coordenadorMensagem}
            chamada="Quer conhecer mais sobre o JUSC? Fale diretamente com o coordenador e venha participar!"
            ladoFoto="direita"
          />

          {/* Banner Secretário: Foto à Esquerda (Contraposição Diagonal Fluida) */}
          <BannerContato
            cargo="Secretário"
            nome={secretarioNome}
            fotoUrl={secretarioFoto}
            whatsapp={secretarioWhatsapp}
            mensagem={secretarioMensagem}
            chamada="Quer marcar um encontro, tirar dúvidas ou saber como participar? Fale com nosso secretário!"
            ladoFoto="esquerda"
          />
        </section>

        {/* 5. Banners de Eventos / Ações especiais */}
        {eventosAtivos.length > 0 && (
          <section aria-label="Eventos e Ações do Grupo" className="space-y-3.5 pt-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FFC72C]" />
              Ações & Comunidade
            </h2>

            <div className="space-y-3">
              {eventosAtivos.map((evento) => (
                <BannerEvento
                  key={evento.id}
                  titulo={evento.titulo}
                  resumo={evento.resumo}
                  descricaoCompleta={evento.descricaoCompleta}
                  imagemUrl={evento.imagemUrl}
                  whatsappCoordenador={coordenadorWhatsapp}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Rodapé institucional com Mapa Google e dados da paróquia */}
      <PublicFooter
        endereco={endereco}
        horario={horario}
        linkMaps={linkMaps}
        instagramUrl={instagram}
      />
    </div>
  );
}
