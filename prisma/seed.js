const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando verificação de seed seguro do banco de dados...");

  // 1. Criar Usuário Admin inicial (com login 'admin') se ainda não existir
  const existeAdmin = await prisma.usuario.findUnique({
    where: { login: "admin" },
  });

  if (!existeAdmin) {
    const adminSenhaHash = await bcrypt.hash("admin123", 10);
    await prisma.usuario.create({
      data: {
        nome: "Coordenação Geral (Admin)",
        login: "admin",
        email: "admin@grupo.com.br",
        senhaHash: adminSenhaHash,
        perfil: "ADMIN",
        status: "ATIVO",
        primeiroAcesso: false,
      },
    });
    console.log("✓ Usuário 'admin' inicial criado com sucesso (senha inicial: 'admin123').");
  } else {
    console.log("✓ Usuário 'admin' já existe. Credenciais existentes preservadas.");
  }

  // 2. Configurações Gerais Iniciais (apenas cria se não existir registro)
  const configExistente = await prisma.configuracaoGeral.findUnique({
    where: { id: 1 },
  });

  if (!configExistente) {
    await prisma.configuracaoGeral.create({
      data: {
        id: 1,
        nomeGrupo: "JUSC",
        subtituloGrupo: "Jovens Unidos Seguindo Cristo",
        paroquiaNome: "Paróquia Menino Jesus",
        logoUrl: "/assets/logo-jusc.jpeg",
        mascoteUrl: "/assets/abelhudo.png",
        corBase: "#FFC72C",
        corSecundaria: "#d97706",
        corDestaque: "#f59e0b",
        descricaoGrupo: "Venha fazer parte da nossa colmeia! Um grupo jovem de oração, amizade verdadeira, música e missão.",

        coordenadorNome: "Coordenador",
        coordenadorFotoUrl: "/assets/coordenador.jpg",
        coordenadorWhatsapp: "5545999068852",
        coordenadorMensagem: "Olá! Vim pelo site e gostaria de saber mais sobre o grupo jovem.",

        secretarioNome: "Secretário",
        secretarioFotoUrl: "/assets/secretario.jpg",
        secretarioWhatsapp: "5545991179727",
        secretarioMensagem: "Olá! Vim pelo site e gostaria de saber sobre os encontros.",

        tesoureiroNome: "Tesoureiro",
        tesoureiroWhatsapp: "5545991179727",
        tesoureiroCidadePix: "Foz do Iguacu",

        enderecoPadrao: "Salinha do Grupo — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra, Foz do Iguaçu - PR)",
        horarioPadrao: "Domingos às 17h",
        linkGoogleMaps: "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR",
        instagramUrl: "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==",

        limiteMesesAlertaAusencia: 3,
        limiteMesesInativacao: 12,
      },
    });
    console.log("✓ Configurações gerais iniciais cadastradas com sucesso.");
  } else {
    console.log("✓ Configurações gerais já existentes preservadas.");
  }

  console.log("Seed concluído com segurança.");
}

main()
  .catch((e) => {
    console.error("Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
