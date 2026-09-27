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
- **Pagamentos:** cobrança presencial no local da retirada/entrega (PIX, cartão ou dinheiro). Nenhum pagamento online é processado pela aplicação.
- **Hospedagem:** frontend na Vercel e backend com PostgreSQL no Render.

## Rotas principais

- `/` - marketplace.
- `/receitas` - receitas regionais.
- `/depoimentos` - avaliações e relatos da comunidade.
- `/produto/:id` - detalhes de um produto.
- `/carrinho` - carrinho e confirmação do pedido com pagamento na retirada.
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
```

## Testes e verificações

```bash
npm run lint
npm run build
npm run test:security
npm audit --audit-level=high
```

Os testes de segurança verificam headers, CORS, validação de entrada, proteção de rotas, política de pagamento presencial, exposição de dados sensíveis e armazenamento no navegador.

## Segurança e conformidade

O backend aplica validação de entrada, limite de payload, rate limit em autenticação, CORS por allowlist e headers de segurança. As rotas administrativas exigem token válido e papel autorizado quando o Auth0 está configurado.

O pagamento é acertado presencialmente no ponto de retirada ou na entrega. A aplicação não recebe, processa ou armazena dados de cartão, códigos PIX ou credenciais financeiras: o pedido é criado com `paymentStatus: pending_on_pickup` e a cobrança ocorre no local.

Esses controles apoiam a conformidade técnica, mas não substituem auditoria jurídica, avaliação formal da LGPD ou certificação PCI-DSS.

## Notificações por e-mail

Ao confirmar um pedido, o backend envia dois e-mails transacionais:

- O cliente recebe a confirmação da compra com o resumo dos itens, o total e o local de retirada ou entrega, no endereço informado em `customerEmail` (obrigatório e validado no servidor).
- Cada produtor envolvido no pedido recebe um aviso para preparar os produtos, agrupado por produtor para não duplicar mensagens.

O endereço do produtor é resolvido no catálogo do servidor a partir do `productId`, nunca a partir do que o cliente envia. O envio é best-effort: se o SMTP falhar, o pedido continua salvo e a API responde normalmente. Sem as variáveis `SMTP_*` configuradas, o pedido é aceito e o e-mail é apenas ignorado.

## Limitações

- Auth0 e PostgreSQL dependem de configuração externa.
- Sem essas variáveis, o ambiente local utiliza dados iniciais para desenvolvimento e teste.
- A confirmação financeira é feita presencialmente pelo produtor no momento da retirada ou entrega.

## Deploy

As instruções de implantação estão em [DEPLOY_VERCEL_RENDER.md](DEPLOY_VERCEL_RENDER.md). O projeto está dentro da subpasta `agrohero-toledo-deploy`; esse caminho deve ser informado como diretório raiz na Vercel e já está declarado em `render.yaml`.
