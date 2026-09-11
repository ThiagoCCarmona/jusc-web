const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados (sem dados simulados)...");

  // Limpar dados simulados se existirem
  await prisma.presenca.deleteMany();
  await prisma.encontro.deleteMany();
  await prisma.integrante.deleteMany();
  await prisma.banner.deleteMany();
  console.log("Tabelas de dados limpas com sucesso.");

  // 1. Criar ou atualizar Usuário Admin inicial (com login 'admin')
  const adminSenhaHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { login: "admin" },
    update: {
      perfil: "ADMIN",
      status: "ATIVO",
      senhaHash: adminSenhaHash,
    },
    create: {
      nome: "Coordenação Geral (Admin)",
      login: "admin",
      email: "admin@jusc.com.br",
      senhaHash: adminSenhaHash,
      perfil: "ADMIN",
      status: "ATIVO",
      primeiroAcesso: false, // Admin inicial já tem acesso direto
    },
  });

  // 2. Configurações Gerais Oficiais do JUSC
  await prisma.configuracaoGeral.upsert({
    where: { id: 1 },
    update: {
      coordenadorNome: "Brunão",
      coordenadorFotoUrl: "/assets/coordenador.jpg",
      coordenadorWhatsapp: "5545999068852",
      coordenadorMensagem: "Oii, vim pelo site e queria saber mais sobre o JUSCÃO",

      secretarioNome: "Foletto",
      secretarioFotoUrl: "/assets/secretario.jpg",
      secretarioWhatsapp: "5545991179727",
      secretarioMensagem: "Oii, vim pelo site e queria marcar um encontro no JUSC",

      enderecoPadrao: "Salinha do JUSC — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra, Foz do Iguaçu - PR)",
      horarioPadrao: "Domingos às 17h",
      linkGoogleMaps: "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR",
      instagramUrl: "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==",

      limiteMesesAlertaAusencia: 3,
      limiteMesesInativacao: 12,
    },
    create: {
      id: 1,
      coordenadorNome: "Brunão",
      coordenadorFotoUrl: "/assets/coordenador.jpg",
      coordenadorWhatsapp: "5545999068852",
      coordenadorMensagem: "Oii, vim pelo site e queria saber mais sobre o JUSCÃO",

      secretarioNome: "Foletto",
      secretarioFotoUrl: "/assets/secretario.jpg",
      secretarioWhatsapp: "5545991179727",
      secretarioMensagem: "Oii, vim pelo site e queria marcar um encontro no JUSC",

      enderecoPadrao: "Salinha do JUSC — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra, Foz do Iguaçu - PR)",
      horarioPadrao: "Domingos às 17h",
      linkGoogleMaps: "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR",
      instagramUrl: "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==",

      limiteMesesAlertaAusencia: 3,
      limiteMesesInativacao: 12,
    },
  });

  console.log("Seed concluído! Usuário 'admin' com senha 'admin123' configurado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
