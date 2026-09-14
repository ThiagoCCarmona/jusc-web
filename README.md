# Sistema de Gestão Pastoral e Portal Paroquial 🕊️

> Plataforma completa de presença digital e gestão pastoral para Grupos de Jovens, Movimentos Paroquiais e Pastorais.
> Inclui portal público responsivo ("Link-in-Bio" pastoral) e painel administrativo interno para controle de integrantes, presenças, encontros, campanhas de camisetas com Pix dinâmico e relatórios para fornecedores e tesouraria.

---

## 🌟 Principais Recursos

### 🎨 1. Personalização White-Label (Multi-Grupo)
O sistema é 100% configurável para qualquer grupo de jovens ou pastoral do Brasil:
- **Identidade Visual Dinâmica**: Defina pelo painel o **Nome do Grupo**, **Subtítulo**, **Paróquia**, **Slogan/Apresentação**, **Logotipo** e **Mascote**.
- **Paleta de Cores Customizável**: Alterne entre a paleta padrão dourada/amarela ou configure até 3 cores base do seu grupo (Cor Primária, Secundária e Destaque), aplicadas dinamicamente em todo o site público e no painel administrativo.
- **Suporte Nativo a Modo Claro e Modo Escuro**: Contraste refinado (WCAG AA) com persistência automática de preferência.

### 📱 2. Página Pública Pastoral ("Link in Bio")
- **Contatos Oficiais via WhatsApp**: Banners clicáveis com mensagens pré-formatadas para falar diretamente com o Coordenador e com o Secretário.
- **Banners Informativos**: Avisos urgentes e eventos paroquiais com imagem de capa editável e expiração automática controlada no backend.
- **Mapa Interativo**: Localização exata da paróquia ou sala de encontros integrada ao Google Maps.
- **Recesso Pastoral**: Exibição elegante na home quando as atividades estiverem em pausa/férias, congelando temporariamente o cálculo de ausência dos integrantes.
- **Conformidade LGPD**: Termos de uso, política de privacidade e proteção de dados de menores.

### 👕 3. Campanhas e Encomendas de Camisetas
- **Múltiplas Campanhas Simultâneas**: Suporte a mais de uma campanha ativa ao mesmo tempo na tela inicial (ex.: Camiseta do Retiro e Moletom do Grupo).
- **Preços Diferenciados por Modelo**: Configure modelos distintos em uma mesma campanha com preços específicos (ex.: Tradicional R$ 40,00, Baby Look R$ 42,00, Moletom R$ 85,00).
- **Galeria com Legendas**: Cadastro de fotos identificando cada modelo ou tabelas de medidas corporais.
- **Personalização de Nome e Número**: Opcional por campanha para estampas personalizadas nas costas.
- **Checkout Inteligente**:
  - Opção de pagamento à vista (100%) ou parcelado (50% de sinal na encomenda e 50% na retirada).
  - Formas de pagamento: **Pix** ou **Dinheiro**.
  - **Geração de QR Code Pix dinâmico** e código **Copia-e-Cola (EMV)** automático usando a chave e dados do Tesoureiro configurados no painel.
- **Gestão de Pedidos no Painel (Admin e Tesoureiro)**:
  - Registro e baixa de pagamentos (sinal, retirada ou quitação total).
  - Possibilidade de **desfazer baixa de pagamento** caso tenha sido marcada por engano.
  - Emissão de recibo/comprovante individual em PDF para o comprador.
  - **Relatório para o Fornecedor**: Exportação em **PDF** e **Planilha (CSV)** com contagem exata por modelo, tamanho e lista de personalizações (sem expor valores ou dados financeiros).
  - **Relatório Financeiro**: Exportação em PDF com balanço de arrecadações, pagamentos pendentes e totais da campanha.

### 👥 4. Gestão de Integrantes e Encontros
- **Ficha Completa do Integrante**: Controle de sacramentos (Batismo, 1ª Eucaristia, Crisma), histórico de participação no CLJ (Curso de Liderança Juvenil com número ordinal formatado), restrições alimentares e alergias, e contato de responsáveis para menores.
- **Tempo de Caminhada no Grupo**: Suporta 3 níveis de precisão (`COMPLETA`, `MES_ANO` e `DESCONHECIDA`).
- **Cálculo Inteligente de Status por Ausência**:
  - Presença em encontro reativa o integrante automaticamente.
  - Alerta de ausência prolongada após 3 meses sem presença (filtrável no painel).
  - Mudança automática para status Inativo após 12 meses sem presenças (com suporte a inativação manual justificada).
- **Chamada de Encontros**: Registro rápido de presenças de integrantes e visitantes.
- **Aniversariantes**: Listagem automática de aniversários de nascimento e de tempo de grupo no mês e no dia.
- **Auditoria e Perfis de Acesso**: Níveis de acesso para Administrador e Colaborador/Tesoureiro, com log de auditoria detalhado.

---

## 🚀 Como Rodar Localmente (Desenvolvimento)

### Pré-requisitos
- Node.js 20+ instalado.
- Git instalado.

### Passo a Passo
1. Clone o repositório:
   ```bash
   git clone https://github.com/ThiagoCCarmona/jusc-web.git
   cd jusc-web
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

4. Inicialize o banco de dados SQLite local e as sementes iniciais:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

6. Acesse no navegador:
   - **Site Público**: [http://localhost:3000](http://localhost:3000)
   - **Painel Administrativo**: [http://localhost:3000/login](http://localhost:3000/login)

### 🔑 Credenciais Iniciais de Acesso:
- **Usuário**: `admin`
- **Senha**: `admin123`
*(No primeiro acesso, você pode alterar a senha e atualizar as informações da paróquia e do grupo na aba de Configurações).*

---

## 🐳 Deploy em Produção (VPS com Docker)

O projeto está configurado para deploy em contêineres Docker com Next.js em modo `standalone` e banco SQLite persistido em volume no host.

### Estrutura de Volumes no Host
- `./data`: Armazena o banco de dados de produção (`prod.db`).
- `./uploads`: Armazena fotos enviadas pelo painel (fotos de perfil, fotos de campanhas e banners).

Ambos os diretórios são montados como volumes e estão protegidos no `.gitignore`, garantindo que atualizações de código via Git jamais sobrescrevam os dados de produção.

### Primeiro Deploy na VPS
1. Clone o repositório na VPS:
   ```bash
   git clone https://github.com/ThiagoCCarmona/jusc-web.git
   cd jusc-web
   ```
2. Crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   # Defina um JWT_SECRET forte e seguro no arquivo .env
   ```
3. Suba o container:
   ```bash
   docker compose up -d --build
   ```
   *O script de entrada (`docker-entrypoint.sh`) inicializará automaticamente o banco de dados e as configurações na primeira execução.*

---

## 🛡️ Como Atualizar a VPS em Produção (Sem Quebrar o Ambiente)

Caso a aplicação já esteja rodando na sua VPS, o processo de atualização é simples e seguro:

### 1. (Recomendado) Faça uma cópia de segurança rápida do banco:
```bash
cp ./data/prod.db ./data/prod.db.backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Atualize os arquivos via Git:
```bash
git pull origin main
```

### 3. Reconstrua e reinicie o container:
```bash
docker compose up -d --build
```

### 🔍 O que acontece nos bastidores:
- O banco de dados existente (`./data/prod.db`) é mantido intacto.
- O `docker-entrypoint.sh` executa `npx prisma db push`, aplicando as novas tabelas (campanhas de camisetas, pausas de encontros) e novas colunas sem perda de dados existentes.
- Os uploads (`./uploads`) continuam salvos exatamente onde estavam.
- Nenhuma informação de integrante, encontro ou presença é perdida.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components e Standalone Build)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) com paleta dinâmica CSS Variables
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com SQLite persistido
- **Autenticação**: JWT (`jsonwebtoken`) com cookies HTTP-Only e `bcryptjs`
- **Geração de Documentos**: `jspdf` e `jspdf-autotable` para relatórios em PDF
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Deploy**: Docker, Docker Compose e GitHub Actions CI/CD

