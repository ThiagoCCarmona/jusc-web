## 1. PAPEL E OBJETIVO

Você é um(a) engenheiro(a) de software sênior full-stack, responsável por projetar e implementar, do zero, uma aplicação web para o **JUSC — Jovens Unidos Seguindo Cristo**, grupo de jovens da **Paróquia Menino Jesus** (Foz do Iguaçu - PR, Brasil).

A aplicação tem dois públicos:
1. **Público geral / visitantes** — uma página pública, no estilo "link in bio", com identidade visual do grupo.
2. **Equipe interna do grupo (coordenação/liderança)** — um sistema autenticado de gestão de integrantes, encontros, presenças e relatórios.

Trabalhe de forma incremental: primeiro proponha a arquitetura e o modelo de dados, confirme entendimento dos pontos em aberto (seção 14), e só então implemente. Priorize simplicidade, manutenibilidade e baixo custo de hospedagem (é um grupo de jovens paroquial, sem orçamento de empresa).

---

## 2. IDENTIDADE VISUAL E BRANDING

Dois assets serão fornecidos e **devem ser usados no projeto**:
- **Logo oficial**: brasão circular com cálice/hóstia irradiando raios, escrito "JUSC" no cálice e "JOVENS UNIDOS SEGUINDO CRISTO" ao redor, em dourado sobre fundo preto/transparente.
- **Mascote "Abelhudo"**: uma abelha antropomórfica amarela e preta, vestindo camiseta preta com a logo do JUSC, acenando.

Diretrizes de design:
- **Paleta de cores**: amarelo/dourado (tom principal, ex.: `#FFC72C`) e preto (`#0A0A0A` / `#1A1A1A`), com branco/creme como cor neutra de apoio. Evite outras cores fortes — use no máximo uma cor de destaque para estados de erro/alerta (vermelho) e sucesso (verde), de forma discreta.
- **Linha minimalista e moderna**: bastante espaço em branco/negativo, tipografia sem serifa, cantos arredondados suaves, ícones com traço fino, sem excesso de elementos decorativos (nada de padrões "religiosos genéricos" — a identidade é a colmeia/abelha).
- **Elemento "abelha/colmeia"**: use sutilmente formas hexagonais (favo de mel) em backgrounds, divisores de seção, cards ou loaders — sem exagerar.
- **Uso do mascote Abelhudo**: aparece na home (ex.: banner de boas-vindas), em telas vazias ("nenhum integrante cadastrado ainda"), em página 404 e, opcionalmente, como ícone de loading.
- **Uso da logo**: no cabeçalho (header), no favicon (versão simplificada) e no rodapé.
- **Modo claro e escuro obrigatórios**, com alternância manual (toggle) e detecção da preferência do sistema como padrão inicial. Adapte o preto/amarelo para manter contraste e legibilidade em ambos os modos (ex.: no modo escuro, o fundo não deve ser puro preto igual ao da logo, para não "sumir" a marca — use um cinza-quase-preto).
- Garanta contraste mínimo AA (WCAG) entre texto e fundo em ambos os temas, especialmente em textos pretos sobre amarelo e vice-versa.

---

## 3. STACK TECNOLÓGICA SUGERIDA

Sugestão (adapte se você, agente, tiver stack padrão diferente — mas mantenha os requisitos funcionais):

- **Frontend**: React (Next.js) + TypeScript + Tailwind CSS. Componentização com um design system simples (ex.: shadcn/ui) para acelerar.
- **Backend**: API routes do próprio Next.js ou serviço separado em Node.js (Express/NestJS).
- **Banco de dados**: PostgreSQL (via Prisma ORM) — relacional, adequado ao domínio (integrantes, encontros, presenças).
- **Autenticação**: sistema próprio com sessão/JWT + senha com hash (bcrypt/argon2), ou NextAuth com provedor de credenciais.
- **Hospedagem sugerida (baixo custo)**: Vercel (frontend/API) + banco gerenciado gratuito/baixo custo (Neon, Supabase ou Railway).
- **Armazenamento de imagens** (fotos de coordenador/secretário, banners): serviço de storage (Cloudinary, S3 ou equivalente gratuito) — não salvar binário no banco.
- **Responsivo mobile-first**, testado em resoluções de celular, tablet e desktop.
- Considere transformar em **PWA** (instalável na tela inicial do celular), já que o público (jovens) acessará majoritariamente pelo smartphone.

---

## 4. ÁREA PÚBLICA (sem login)

### 4.1 Header (topo, fixo)
- Logo do JUSC à esquerda.
- Toggle de modo claro/escuro.
- Botão **"Entrar"** / ícone de login no canto superior direito → leva à tela de login (`/login`).

### 4.2 Home (`/`)
Ordem de exibição das seções, de cima para baixo:

1. **Banner de alerta (vermelho)** — só aparece se houver um alerta ativo publicado pelo Admin (ver seção 7.6). Fica **acima de todos os outros banners**. Mostra título curto + justificativa resumida ("Não haverá encontro dia XX/XX — motivo resumido"). Ao clicar/expandir, mostra a justificativa completa e um botão **"Falar com o coordenador no WhatsApp"** que abre o link de WhatsApp do coordenador. Some automaticamente da tela após a data configurada de expiração (o Admin define até quando o alerta deve ficar visível).
2. **Boas-vindas / hero** com o mascote Abelhudo, nome do grupo e chamada breve.
3. **Banner amarelo — Coordenador**: foto + nome do coordenador, texto tipo "Quer conhecer o grupo? Fale com nosso coordenador". Ao clicar, abre:
   `https://api.whatsapp.com/send?phone=5545999068852&text=Oii%2C%20vim%20pelo%20site%20e%20queria%20saber%20mais%20sobre%20o%20JUSC%C3%83O`
4. **Banner amarelo — Secretário**: foto + nome do secretário, texto tipo "Quer marcar um encontro? Fale com nosso secretário". Ao clicar, abre:
   `https://api.whatsapp.com/send?phone=5545991179727&text=Oii%2C%20vim%20pelo%20site%20e%20queria%20marcar%20um%20encontro%20no%20JUSC`
   - Foto e nome de coordenador/secretário devem ser **editáveis pelo Admin** (não hardcoded), pois a gestão do grupo muda ao longo do tempo. O número de WhatsApp também deve ser configurável no painel admin, não fixo no código.
5. **Banner(s) de evento/venda (amarelo, opcional, criado pelo Admin)**: título, descrição curta, imagem opcional. Ao expandir, mostra descrição completa e botão para WhatsApp do coordenador. Some automaticamente após a data de expiração definida pelo Admin. Pode haver mais de um simultaneamente; exibir em lista/carrossel abaixo dos banners fixos.

### 4.3 Rodapé (footer)
- Nome completo da paróquia: **Paróquia Menino Jesus**.
- Endereço: **Avenida Pôr do Sol, 2200, Conjunto Libra, Foz do Iguaçu - PR - Brasil**.
- Dia/horário do encontro: **Domingos às 17h**.
- **Mapa incorporado (embed do Google Maps)** apontando para o endereço/local (usar iframe de embed do Google Maps, não apenas o link curto informado, que é de compartilhamento — gerar o embed a partir do endereço ou das coordenadas do local).
- Link "Como chegar" abrindo o Google Maps em nova aba.
- Pequena logo do JUSC.
- Links: Política de Privacidade, Termos de Uso (ver seção 8).
- (Opcional, sugestão) Ícones de redes sociais do grupo, se houver (Instagram, etc.) — campo editável pelo Admin, deixar em branco se não usar.
- Ano corrente + "© JUSC — Paróquia Menino Jesus".

---

## 5. AUTENTICAÇÃO E PERFIS DE ACESSO

Dois perfis de usuário no sistema:

| Perfil | Pode fazer |
|---|---|
| **Admin** | Tudo que "Colaborador" pode, **+** gerenciar usuários do sistema (criar/editar/desativar contas de acesso), gerenciar banners/alertas da home, editar dados de coordenador/secretário (foto, nome, telefone), configurações gerais do sistema. |
| **Colaborador** (liderança/coordenação com login) | Acessa o menu interno: cadastro de integrantes, registro de encontro, visualização de integrantes, aniversariantes, relatórios/dashboards. **Não** acessa o painel de administração de usuários/banners. |

- Tela de **login** (`/login`): usuário/e-mail + senha. Sem opção de autocadastro público — contas só são criadas pelo Admin.
- Fluxo de **"esqueci minha senha"** (recuperação por e-mail).
- Sessão expira após período de inatividade configurável; logout manual disponível no menu.
- Todas as senhas armazenadas com hash seguro (bcrypt/argon2), nunca em texto plano.
- Rotas internas protegidas por middleware de autenticação e checagem de perfil (Admin vs Colaborador).

---

## 6. ÁREA LOGADA — MENU INTERNO

Ao logar, o usuário cai em um **Painel/Dashboard** com atalhos para:

1. Cadastro de integrantes
2. Registro de encontro
3. Visualizar integrantes cadastrados
4. Aniversariantes do mês (com destaque para quem faz aniversário **hoje**)
5. Aniversariantes de grupo do mês (quem completa X anos/meses de grupo)
6. Relatórios / Dashboards
7. *(somente Admin)* Administração (usuários e banners)

### 6.1 Cadastro de Integrantes

Formulário com os campos:

| Campo | Obrigatório | Observações |
|---|---|---|
| Nome completo | Sim | |
| Apelido | Não | |
| Telefone | Sim | Máscara de telefone BR |
| Data de nascimento | Sim | Usado para aniversariantes |
| Nome do responsável | Sim | Pensado para integrantes menores de idade |
| Telefone do responsável | Sim | |
| Tempo de grupo | Não, mas com regra especial ↓ | Ver lógica abaixo |
| Batismo (sim/não) | Sim | |
| Primeira Eucaristia (sim/não) | Sim | |
| Crisma (sim/não) | Sim | |
| Observação | Não | Texto livre |

**Lógica do campo "Tempo de grupo"**: deve suportar 3 níveis de precisão, pois nem todo integrante lembra a data exata:
- **Data completa** (dia/mês/ano) — se o integrante souber.
- **Apenas mês/ano** — se souber só o período aproximado.
- **Desconhecido** — se não souber informar.

Isso deve ser modelado no banco com um campo indicando o "grau de precisão" da informação (ver seção 9, modelo de dados), pois isso impacta diretamente a lógica de "aniversário de grupo" (seção 6.5).

**Campos automáticos, gerados pelo sistema (não editáveis manualmente na criação)**:
- **ID único** do integrante (gerado automaticamente).
- **Data do cadastro** (timestamp automático).
- **Cadastrado por** (usuário logado que fez o registro).
- **Status**: `Ativo` por padrão. Passa a `Inativo` automaticamente conforme regra de ausência (seção 9.2), mas também pode ser alterado manualmente por um Colaborador/Admin com justificativa (ex.: saiu do grupo por opção própria).

Sugestão adicional (avaliar com o usuário): permitir foto do integrante (opcional) e data específica de cada sacramento (batismo/1ª eucaristia/crisma), não só o sim/não — útil para futuras celebrações ou registros pastorais.

### 6.2 Registro de Encontro

Formulário com:
- **Local do encontro** (pré-preenchido com o endereço padrão da paróquia, mas editável — para casos de encontros fora da sede).
- **Data e horário** do encontro.
- **Quem passou/conduziu o encontro** (selecionável a partir dos integrantes/colaboradores cadastrados, ou texto livre).
- **Lista de presença**: seleção múltipla entre os integrantes ativos cadastrados (com busca). Incluir opção de adicionar **"visitantes"** (nomes avulsos, ainda não cadastrados no sistema) para não perder o registro de quem participou sem forçar cadastro completo na hora.
- **Tema/assunto do encontro** (opcional, campo livre — sugestão, confirmar com usuário).

### 6.3 Visualizar Integrantes Cadastrados

- Lista/tabela com busca por nome/apelido e filtros por: status (ativo/inativo), sacramentos, faixa etária, tempo de grupo.
- Ao clicar em um integrante: tela de detalhe com todos os dados, histórico de presenças e opção de editar/inativar manualmente.
- Indicador visual (badge) de status: Ativo / Inativo / **Alerta de ausência** (ver seção 9.2).

### 6.4 Aniversariantes do Mês

- Lista de integrantes que fazem aniversário no mês corrente, ordenada por dia.
- **Destaque visual especial** para quem faz aniversário **hoje** (ex.: card diferenciado, ícone de bolo/confete, cor de destaque).

### 6.5 Aniversariantes de Grupo (tempo de casa)

- Lista de integrantes que completam X meses/anos de grupo no mês corrente, calculado a partir do campo "Tempo de grupo":
  - Se a **data completa** for conhecida: calcular o dia exato e destacar se for hoje, igual à lógica de aniversário de nascimento.
  - Se só **mês/ano** for conhecido: exibir na lista do mês correspondente, sem destaque de "dia exato" (já que não existe essa informação).
  - Se **desconhecido**: não entra nessa listagem.

### 6.6 Relatórios / Dashboards

No mínimo:
- **Relatório de presenças** nos últimos encontros (tabela: encontro x integrante x presente/ausente), filtrável por período.
- **Relatório de frequência de um integrante específico** nos últimos X encontros (X configurável pelo usuário no momento de gerar o relatório), com percentual de presença.
- **Lista/alerta de integrantes com ausência prolongada** (ver regra na seção 9.2), filtrável (ex.: por tempo de ausência, por status).
- Exportação dos relatórios em **CSV e/ou PDF**.
- Dashboard resumido com indicadores gerais: total de integrantes ativos, total inativos, média de presença nos últimos encontros, quantidade de alertas de ausência em aberto, distribuição por sacramentos recebidos.

### 6.7 Painel de Administração (somente Admin)

- **Gestão de usuários do sistema**: criar/editar/desativar contas de acesso (Colaborador/Admin), redefinir senha de outro usuário, ver log de quem tem acesso.
- **Gestão de banners/alertas da home**:
  - Criar/editar/remover **alerta vermelho** (título, justificativa resumida, justificativa completa, data de expiração).
  - Criar/editar/remover **banner de evento/venda amarelo** (título, descrição curta, descrição completa, imagem opcional, data de expiração).
  - Editar dados fixos de **coordenador e secretário** (nome, foto, número de WhatsApp, mensagem pré-formatada do link).
- **Configurações gerais**: endereço/local padrão de encontro exibido no rodapé e pré-preenchido no registro de encontro, horário padrão de encontro, link do Google Maps.
- Recomenda-se um **log de auditoria** simples (quem alterou o quê e quando) para dados sensíveis, dado o caráter institucional/pastoral do sistema.

---

## 7. MODELO DE DADOS (referência para o schema)

```
Integrante
- id (uuid/serial, PK)
- nome_completo (string, obrigatório)
- apelido (string, opcional)
- telefone (string, obrigatório)
- data_nascimento (date, obrigatório)
- nome_responsavel (string, obrigatório)
- telefone_responsavel (string, obrigatório)
- tempo_grupo_data_completa (date, opcional)
- tempo_grupo_mes (int 1-12, opcional)
- tempo_grupo_ano (int, opcional)
- tempo_grupo_precisao (enum: 'completa' | 'mes_ano' | 'desconhecida')
- batismo (boolean, obrigatório)
- primeira_eucaristia (boolean, obrigatório)
- crisma (boolean, obrigatório)
- observacao (text, opcional)
- status (enum: 'ativo' | 'inativo', default 'ativo')
- motivo_inativacao (string, opcional — preenchido se inativado manualmente)
- data_cadastro (timestamp, automático)
- cadastrado_por (FK -> Usuario)
- foto_url (string, opcional — sugestão)

Encontro
- id (uuid/serial, PK)
- data_hora (timestamp, obrigatório)
- local (string, obrigatório — pré-preenchido)
- conduzido_por (string ou FK -> Integrante/Usuario)
- tema (string, opcional)
- criado_por (FK -> Usuario)
- criado_em (timestamp, automático)

Presenca (tabela associativa Encontro x Integrante)
- id (PK)
- encontro_id (FK -> Encontro)
- integrante_id (FK -> Integrante, nulo se visitante)
- nome_visitante (string, opcional — para não cadastrados)
- presente (boolean)

Usuario (acesso ao sistema)
- id (PK)
- nome
- email / login
- senha_hash
- perfil (enum: 'admin' | 'colaborador')
- status (ativo/inativo)
- criado_por (FK -> Usuario, Admin que criou)
- criado_em (timestamp)

Banner
- id (PK)
- tipo (enum: 'alerta' | 'evento')
- titulo
- resumo
- descricao_completa
- imagem_url (opcional)
- data_expiracao
- ativo (boolean)
- criado_por (FK -> Usuario)

ConfiguracaoGeral
- coordenador_nome, coordenador_foto_url, coordenador_whatsapp
- secretario_nome, secretario_foto_url, secretario_whatsapp
- endereco_padrao, horario_padrao, link_google_maps
```

---

## 8. PÁGINAS/ITENS CONVENCIONAIS (complementando o que foi pedido)

Todo site institucional com cadastro de dados pessoais — ainda mais envolvendo **menores de idade** — deve ter, no mínimo:

- **Política de Privacidade**: explicando quais dados são coletados (inclusive de responsáveis/menores), finalidade, quem tem acesso, tempo de retenção e como solicitar exclusão — em conformidade com a **LGPD** (Lei Geral de Proteção de Dados, Brasil).
- **Termos de Uso**.
- **Consentimento no cadastro**: ao cadastrar um integrante (especialmente menor de idade), sinalizar que os dados do responsável foram informados com conhecimento/autorização dele. Sugerir um checkbox de confirmação no formulário de cadastro.
- **Página de erro 404** personalizada (usando o mascote Abelhudo, ex.: "Ops, o Abelhudo se perdeu no caminho").
- **Meta tags e SEO básico**: título, descrição, favicon (versão simplificada da logo), Open Graph (para quando o link for compartilhado no WhatsApp/Instagram, mostrar preview com logo e descrição do grupo).
- **Acessibilidade**: textos alternativos em imagens, navegação por teclado, contraste adequado.
- **Formulários com validação clara** (mensagens de erro específicas, não genéricas) e feedback de sucesso/erro nas ações (toasts/alerts).
- **Estados de carregamento (loading)** e **estados vazios** ("nenhum integrante cadastrado ainda") tratados visualmente, usando o mascote quando fizer sentido.
- **Backup do banco de dados** configurado (mesmo que simples, automático).

---

## 9. REGRAS DE NEGÓCIO IMPORTANTES

### 9.1 Cálculo de status por ausência
- O sistema deve calcular, a partir da tabela `Presenca`, a **data do último encontro em que o integrante esteve presente**.
- Se essa data ultrapassar **12 meses** sem presença → status muda automaticamente para **Inativo**.
- Se ultrapassar **3 meses** sem presença (mas ainda não os 12 meses) → **não** inativa, mas gera um **alerta filtrável** ("ausência prolongada") na lista de integrantes/relatórios, para a liderança verificar o que houve.
- Essas regras (3 meses / 12 meses) devem ser fáceis de ajustar futuramente (parametrizar em configuração, não hardcoded como constante espalhada pelo código).
- Reativação: se o integrante voltar a aparecer em um encontro, o status volta automaticamente para Ativo e o alerta de ausência é encerrado.

### 9.2 Expiração de banners
- Alertas (vermelhos) e banners de evento (amarelos) somem automaticamente da home assim que a `data_expiracao` for ultrapassada — validado no backend (não confiar só no frontend), para não exibir conteúdo desatualizado.

### 9.3 Hierarquia de exibição na home
Alerta vermelho (se ativo) > Hero/boas-vindas > Banner Coordenador > Banner Secretário > Banner(s) de evento (se ativos).

---

## 10. REQUISITOS NÃO FUNCIONAIS

- **Responsivo**: mobile-first, testado em telas pequenas (a maioria dos jovens vai acessar pelo celular), tablets e desktop.
- **Modo claro/escuro** com persistência da preferência do usuário.
- **Performance**: carregamento rápido mesmo em conexões móveis mais fracas (comum em regiões de fronteira); otimizar imagens (logo/mascote) em formatos modernos (WebP) e tamanhos adequados.
- **Segurança**:
  - Senhas com hash forte, nunca em texto plano.
  - Proteção contra força bruta no login (rate limiting).
  - Proteção CSRF/XSS/SQL Injection (uso de ORM parametrizado).
  - HTTPS obrigatório em produção.
  - Variáveis sensíveis (chaves, strings de conexão) em variáveis de ambiente, nunca no código-fonte.
  - Controle de acesso por perfil validado sempre no backend, não apenas escondendo botões no frontend.
- **LGPD / Privacidade**: dados de menores e de responsáveis tratados como sensíveis; acesso restrito a usuários autenticados com perfil adequado; possibilidade de exportar/excluir dados de um integrante a pedido.
- **Manutenibilidade**: código organizado em componentes reutilizáveis, nomenclatura consistente, comentários em pontos de regra de negócio não óbvia (ex.: cálculo de ausência e aniversário de grupo).

---

## 11. CRITÉRIOS DE ACEITE (checklist final)

- [ ] Home pública funcional com hero, banners (coordenador, secretário, evento, alerta) e rodapé com mapa incorporado.
- [ ] Login funcional com dois perfis (Admin/Colaborador) e controle de acesso real no backend.
- [ ] Cadastro de integrante com todos os campos especificados e lógica de "tempo de grupo" com 3 níveis de precisão.
- [ ] Registro de encontro com presença (incluindo visitantes) funcionando corretamente.
- [ ] Cálculo automático de inatividade (12 meses) e alerta de ausência (3 meses) funcionando e filtrável.
- [ ] Listagens de aniversariantes (nascimento e tempo de grupo) com destaque para "hoje".
- [ ] Relatórios de presença exportáveis (CSV/PDF).
- [ ] Painel Admin para gerenciar usuários e banners, com expiração automática validada no backend.
- [ ] Modo claro/escuro funcionando em 100% das telas.
- [ ] Totalmente responsivo (celular, tablet, desktop).
- [ ] Logo e mascote Abelhudo aplicados de forma consistente (header, favicon, estados vazios, 404).
- [ ] Política de Privacidade e Termos de Uso publicados.

---

## 12. PONTOS EM ABERTO — CONFIRMAR COM O SOLICITANTE ANTES DE FINALIZAR O ESCOPO

1. Quem poderá se autocadastrar como integrante (formulário público) ou o cadastro será **sempre feito manualmente pela liderança**, como descrito? (o texto original sugere que só a liderança cadastra).
2. Deve haver um terceiro perfil "Coordenador"/"Secretário" com permissões diferentes de um Colaborador comum, ou todos os logados (exceto Admin) têm exatamente as mesmas permissões?
3. Datas específicas dos sacramentos (não só sim/não) são desejadas?
4. Foto de perfil do integrante: desejada ou não?
5. Quantidade de encontros "X" no relatório de frequência: deve ter um valor padrão sugerido (ex.: últimos 10 encontros)?
6. Redes sociais do grupo devem ser exibidas no rodapé?
7. Confirmar hospedagem/orçamento disponível, para adequar a stack sugerida (seção 3) à realidade do grupo.

---

**Instrução final para o agente de desenvolvimento**: implemente por etapas — (1) estrutura do projeto e modelo de dados, (2) autenticação e controle de acesso, (3) área pública, (4) módulos internos (cadastro, encontro, aniversariantes, relatórios), (5) painel admin, (6) revisão de responsividade/tema claro-escuro/acessibilidade. Ao final de cada etapa, apresente um resumo do que foi implementado antes de seguir para a próxima.
