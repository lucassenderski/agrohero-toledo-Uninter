# Agro Hero Toledo

## Descrição

O Agro Hero Toledo é uma aplicação web responsiva para aproximar agricultores familiares, consumidores e iniciativas de agricultura sustentável no município de Toledo, Paraná.

A aplicação disponibiliza um marketplace de produtos, receitas regionais, depoimentos da comunidade e um painel de gestão para produtores e administradores.

## Objetivos

- Facilitar o acesso a alimentos produzidos localmente.
- Apoiar a comercialização de produtos da agricultura familiar.
- Reduzir desperdícios por meio de pedidos antecipados.
- Disponibilizar informações sobre origem, produtores e práticas sustentáveis.
- Aplicar controles de autenticação, autorização e proteção de dados.

## Arquitetura

- **Frontend:** React, TypeScript, Vite e Tailwind CSS.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** PostgreSQL, com execução prevista no Render.
- **Autenticação:** Auth0 mediante configuração das variáveis de ambiente.
- **Pagamentos:** checkout hospedado do Mercado Pago, quando configurado.
- **Hospedagem:** frontend na Vercel e backend com PostgreSQL no Render.

## Rotas principais

- `/` - marketplace.
- `/receitas` - receitas regionais.
- `/depoimentos` - avaliações e relatos da comunidade.
- `/produto/:id` - detalhes de um produto.
- `/carrinho` - carrinho e checkout.
- `/login` - autenticação.
- `/produtor` - painel protegido para produtores e administradores.

## Requisitos

- Node.js 20 ou superior.
- npm.
- PostgreSQL para execução persistente em produção.

## Execução local

Na pasta do projeto:

```bash
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:5173`.

Para iniciar a API separadamente:

```bash
RUN_SERVER=1 npm run start:server
```

A API será iniciada em `http://localhost:3000`.

## Variáveis de ambiente

As variáveis abaixo devem ser configuradas somente no ambiente de execução. Não inclua tokens ou segredos no repositório.

Um modelo sem credenciais está disponível em [.env.example](.env.example). Para execução local, copie-o para `.env` e preencha apenas os serviços que serão utilizados.

### Frontend

```env
VITE_API_URL=https://sua-api.onrender.com
VITE_AUTH0_DOMAIN=seu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=seu-client-id
VITE_AUTH0_AUDIENCE=https://api.agrohero.app
```

### Backend

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/agrohero
CORS_ORIGIN=https://seu-frontend.vercel.app
AUTH0_ISSUER_URL=https://seu-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.agrohero.app
AUTH0_ROLES_CLAIM=https://agrohero.app/roles
MERCADOPAGO_ACCESS_TOKEN=seu-token-privado
MERCADOPAGO_WEBHOOK_SECRET=seu-segredo-de-webhook
CHECKOUT_BASE_URL=https://seu-frontend.vercel.app
```

## Testes e verificações

```bash
npm run lint
npm run build
npm run test:security
npm audit --audit-level=high
```

Os testes de segurança verificam headers, CORS, validação de entrada, proteção de rotas, webhooks, exposição de dados sensíveis e armazenamento no navegador.

## Segurança e conformidade

O backend aplica validação de entrada, limite de payload, rate limit em autenticação, CORS por allowlist e headers de segurança. As rotas administrativas exigem token válido e papel autorizado quando o Auth0 está configurado.

O pagamento deve ocorrer no checkout externo do provedor. A aplicação não deve receber ou armazenar número completo de cartão, código CVV ou credenciais de usuários.

Esses controles apoiam a conformidade técnica, mas não substituem auditoria jurídica, avaliação formal da LGPD ou certificação PCI-DSS.

## Limitações

- Auth0, PostgreSQL e Mercado Pago dependem de configuração externa.
- Sem essas variáveis, o ambiente local utiliza dados iniciais para desenvolvimento e teste.
- A confirmação financeira depende de webhook validado pelo provedor de pagamento.

## Deploy

As instruções de implantação estão em [DEPLOY_VERCEL_RENDER.md](DEPLOY_VERCEL_RENDER.md). O projeto está dentro da subpasta `agrohero-toledo-deploy`; esse caminho deve ser informado como diretório raiz na Vercel e já está declarado em `render.yaml`.
