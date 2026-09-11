import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "JUSC — Jovens Unidos Seguindo Cristo | Paróquia Menino Jesus",
  description:
    "Grupo de Jovens da Paróquia Menino Jesus em Foz do Iguaçu - PR. Encontros todos os domingos às 17h. Venha fazer parte da nossa colmeia!",
  icons: {
    icon: "/assets/logo-jusc.jpeg",
    apple: "/assets/logo-jusc.jpeg",
  },
  openGraph: {
    title: "JUSC — Jovens Unidos Seguindo Cristo",
    description: "Grupo de Jovens da Paróquia Menino Jesus (Foz do Iguaçu - PR)",
    images: [
      {
        url: "/assets/logo-jusc.jpeg",
        width: 800,
        height: 800,
        alt: "Brasão JUSC",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
