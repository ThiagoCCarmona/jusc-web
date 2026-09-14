import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let nomeGrupo = "JUSC";
  let subtituloGrupo = "Jovens Unidos Seguindo Cristo";
  let paroquiaNome = "Paróquia Menino Jesus";
  let descricaoGrupo =
    "Grupo de Jovens da Paróquia Menino Jesus em Foz do Iguaçu - PR. Encontros todos os domingos às 17h. Venha fazer parte da nossa colmeia!";
  let logoUrl = "/assets/logo-jusc.jpeg";

  try {
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    if (config) {
      if (config.nomeGrupo) nomeGrupo = config.nomeGrupo;
      if (config.subtituloGrupo) subtituloGrupo = config.subtituloGrupo;
      if (config.paroquiaNome) paroquiaNome = config.paroquiaNome;
      if (config.descricaoGrupo) descricaoGrupo = config.descricaoGrupo;
      if (config.logoUrl) logoUrl = config.logoUrl;
    }
  } catch {
    // fallback
  }

  const tituloAba = `${nomeGrupo} — ${subtituloGrupo} | ${paroquiaNome}`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: tituloAba,
    description: descricaoGrupo,
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    },
    openGraph: {
      title: `${nomeGrupo} — ${subtituloGrupo}`,
      description: `${descricaoGrupo} (${paroquiaNome})`,
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: `Brasão ${nomeGrupo}`,
        },
      ],
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let corBase = "#FFC72C";
  let corSecundaria = "#d97706";
  let corDestaque = "#f59e0b";
  let logoUrl = "/assets/logo-jusc.jpeg";

  try {
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    if (config?.corBase) {
      corBase = config.corBase;
    }
    if (config?.corSecundaria) {
      corSecundaria = config.corSecundaria;
    }
    if (config?.corDestaque) {
      corDestaque = config.corDestaque;
    }
    if (config?.logoUrl) {
      logoUrl = config.logoUrl;
    }
  } catch {
    // fallback se banco ainda carregando
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href={logoUrl} />
        <link rel="apple-touch-icon" href={logoUrl} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --jusc-gold: ${corBase};
            --jusc-primary: ${corBase};
            --jusc-secondary: ${corSecundaria};
            --jusc-accent: ${corDestaque};
          }
          .dark {
            --jusc-gold: ${corBase};
            --jusc-primary: ${corBase};
            --jusc-secondary: ${corSecundaria};
            --jusc-accent: ${corDestaque};
          }
        ` }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#FFC72C] selection:text-black">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
