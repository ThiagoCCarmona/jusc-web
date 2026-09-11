# JUSC — Jovens Unidos Seguindo Cristo 🐝
> Aplicação Web para o Grupo de Jovens da **Paróquia Menino Jesus** (Foz do Iguaçu - PR).

Este projeto conta com duas frentes principais:
1. **Página Pública ("Link in Bio" Pastoral)**: identidade visual própria com paleta amarelo/dourado (`#FFC72C`) e preto, brasão oficial, mascote Abelhudo, banners de contato direto com Coordenador e Secretário via WhatsApp, avisos e eventos paroquiais, mapa interativo do Google Maps e conformidade com a LGPD.
2. **Sistema Interno de Gestão (Admin e Colaboradores)**: autenticação segura, controle de integrantes com 3 níveis de precisão no tempo de grupo, chamada de encontros com visitantes, cálculo automático de ausência/inatividade (Regra 9.1), aniversariantes (nascimento e grupo) e relatórios pastorais exportáveis em CSV e PDF.

---

## 🎨 Identidade Visual e Assets

- **Logo oficial**: `public/assets/logo-jusc.jpeg` (brasão circular com cálice e hóstia irradiando raios dourados).
- **Mascote Abelhudo**: `public/assets/abelhudo.png` (abelha simpática com a camiseta do JUSC).
- **Temas**: Suporte nativo a **Modo Claro** e **Modo Escuro** com persistência e contraste WCAG AA.
- **Padrão Sutil**: Textura de colmeia / favo de mel em elementos de fundo e cartões.

---

## 🚀 Como Rodar Localmente (Desenvolvimento)

### Pré-requisitos
- Node.js 18+ instalado.

### Passo a passo
1. Clone ou acesse a pasta do projeto:
   ```bash
   cd JUSC
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. O banco local SQLite (`dev.db`) já é configurado e inicializado com sementes de teste:
   ```bash
   # Caso queira recriar o banco ou rodar o seed novamente:
   npx prisma db push
   node prisma/seed.js
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse no navegador:
   - **Site Público**: [http://localhost:3000](http://localhost:3000)
   - **Login da Liderança**: [http://localhost:3000/login](http://localhost:3000/login)

### 🔑 Credenciais Iniciais de Acesso:
- **Administrador**: `admin@jusc.com.br` | Senha: `admin123`
- **Colaborador (Liderança)**: `lider@jusc.com.br` | Senha: `lider123`

---

## 🐳 Deploy em VPS com Docker e PostgreSQL

O projeto já inclui `Dockerfile` multi-stage com Next.js em modo `standalone` e `docker-compose.yml` pronto para produção com PostgreSQL 16.

### No servidor VPS:
1. Copie os arquivos do projeto para a VPS.
2. Crie o arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Altere as senhas do banco e a chave `JWT_SECRET` para valores seguros.*

3. Suba os containers com Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. No primeiro deploy, sincronize o banco de dados e execute o seed:
   ```bash
   docker compose exec app npx prisma db push
   docker compose exec app node prisma/seed.js
   ```

### 💾 Rotina de Backup do Banco de Dados (PostgreSQL na VPS):
Para fazer backup a qualquer momento na VPS:
```bash
docker compose exec -t postgres pg_dump -U jusc_user jusc_db > backup_jusc_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📋 Regras de Negócio Implementadas

- **Cálculo de Status por Ausência (Regra 9.1)**:
  - Presença em encontro reativa o integrante automaticamente.
  - Mais de 3 meses sem presença: gera **Alerta de Ausência Prolongada** (filtrável na lista e em relatórios).
  - Mais de 12 meses sem presença: muda o status automaticamente para **Inativo**.
  - Inativação manual com justificativa é preservada.
- **Aniversariantes de Grupo (Regra 6.5)**:
  - Suporta 3 níveis de precisão: `COMPLETA` (dia, mês e ano - destaca quem faz aniversário hoje), `MES_ANO` (celebra no mês sem dia fixo) e `DESCONHECIDA` (ignorado na listagem).
- **Expiração de Banners da Home (Regra 9.2)**:
  - Banners de alerta e de eventos somem automaticamente do site assim que a data de expiração configurada é ultrapassada (validado no backend).
- **Privacidade e LGPD (Seção 8)**:
  - Termo de consentimento no cadastro com proteção para menores de idade.
  - Páginas públicas de `/politica-privacidade` e `/termos-uso`.
  - Página 404 personalizada com o Abelhudo.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS** com suporte a Tema Claro e Escuro (`next-themes`)
- **Prisma ORM** (SQLite em dev, PostgreSQL em produção)
- **Lucide Icons**
- **bcryptjs** (hash de senhas seguro)
- **jsonwebtoken** (sessão segura via cookies HTTP-Only)
- **Docker & Docker Compose** (standalone build de alta performance)
