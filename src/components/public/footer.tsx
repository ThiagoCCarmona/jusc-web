import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, ExternalLink, Instagram } from "lucide-react";

interface FooterProps {
  endereco: string;
  horario: string;
  linkMaps: string;
  instagramUrl?: string | null;
  nomeGrupo?: string;
  subtituloGrupo?: string;
  paroquiaNome?: string;
  logoUrl?: string | null;
  descricaoGrupo?: string | null;
}

export function PublicFooter({
  endereco,
  horario,
  linkMaps,
  instagramUrl,
  nomeGrupo = "JUSC",
  subtituloGrupo = "Jovens Unidos Seguindo Cristo",
  paroquiaNome = "Paróquia Menino Jesus",
  logoUrl = "/assets/logo-jusc.jpeg",
  descricaoGrupo,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-100 dark:bg-[#0c0d11] border-t border-neutral-200 dark:border-neutral-800/80 pt-12 pb-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
          {/* Informações da Paróquia e Grupo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFC72C] bg-black flex-shrink-0 aspect-square">
                <Image
                  src={logoUrl || "/assets/logo-jusc.jpeg"}
                  alt={`Logo ${nomeGrupo}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {nomeGrupo} — {paroquiaNome}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {subtituloGrupo}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {descricaoGrupo || "Um espaço de acolhimento, oração, partilha, missão e amizade para todos os jovens."}
            </p>

            <div className="space-y-2 pt-1 text-sm text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFC72C] flex-shrink-0 mt-1" />
                <span>{endereco}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FFC72C] flex-shrink-0" />
                <span className="font-semibold">{horario}</span>
              </div>
            </div>

            {/* Links de Redes e Ações */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={linkMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Como chegar (Google Maps)
              </a>

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
                  aria-label={`Instagram do ${nomeGrupo}`}
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Mapa Incorporado Dinâmico */}
          <div className="w-full">
            <div className="w-full h-56 rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-md bg-neutral-200 dark:bg-neutral-800 relative">
              <iframe
                title={`Localização de ${paroquiaNome}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  endereco ? `${endereco} ${paroquiaNome}` : `${paroquiaNome} Foz do Iguaçu`
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[20%] contrast-[1.05]"
              />
            </div>
          </div>
        </div>


        {/* Rodapé inferior com Links Legais e Copyright */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {currentYear} {nomeGrupo} — {paroquiaNome}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/politica-privacidade"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </Link>
            <span>•</span>
            <Link
              href="/termos-uso"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
