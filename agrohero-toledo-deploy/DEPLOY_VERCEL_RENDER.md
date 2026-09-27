# Deploy do Agro Hero Toledo

Este projeto utiliza uma arquitetura separada:

- **Vercel:** frontend React/Vite.
- **Render:** API Node.js/Express.
- **Render PostgreSQL:** persistência de produtos, usuários e pedidos.
- **Auth0:** autenticação e autorização por papéis.
- **Pagamento:** presencial no ponto de retirada ou na entrega (PIX, cartão ou dinheiro). Sem gateway online.

O projeto está dentro da pasta `agrohero-toledo-deploy` do repositório. Esse caminho é importante durante a configuração das duas plataformas.

## 1. Preparação do repositório

Na raiz do repositório:

```bash
git status
git add -A
git commit -m "Atualiza aplicação e configuração de deploy"
git push origin main
```

Não inclua arquivos `.env`, tokens, senhas ou o diretório `node_modules`. O `.gitignore` do repositório já ignora esses arquivos.

## 2. Deploy do backend no Render

1. Acesse o [Render](https://render.com).
2. Crie um **Blueprint** e selecione o repositório.
3. Confirme que o Render encontrou `agrohero-toledo-deploy/render.yaml`.
4. O Blueprint criará o serviço web `agro-hero-api` e o banco PostgreSQL `agro-hero-db`.
5. O `rootDir` do serviço já está definido como `agrohero-toledo-deploy`.
6. O Render usará:
   - Build: `npm install && npm run build`;
   - Start: `npm run start:server`;
   - Health check: `/api/health`.

### Variáveis do backend

Configure os valores secretos no painel do Render:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<fornecida pelo PostgreSQL do Render>
CORS_ORIGIN=https://<seu-projeto>.vercel.app
AUTH0_ISSUER_URL=https://<seu-tenant>.us.auth0.com
AUTH0_AUDIENCE=https://api.agrohero.app
AUTH0_ROLES_CLAIM=https://agrohero.app/roles
```

Para habilitar as notificações por e-mail do pedido, adicione também (opcionais):

```env
SMTP_HOST=<host smtp do provedor>
SMTP_PORT=587
SMTP_USER=<usuario smtp>
SMTP_PASSWORD=<senha smtp>
MAIL_FROM=no-reply@agrohero.com.br
APP_URL=https://<seu-projeto>.vercel.app
```

Essas chaves já estão declaradas em `render.yaml`. Sem elas o pedido continua sendo aceito e nenhum e-mail é enviado.

Após o deploy, confirme:

```bash
curl https://<sua-api>.onrender.com/api/health
```

A resposta esperada contém `"status":"ok"` e `"database":"ok"`.

## 3. Configuração do Auth0

No Auth0:

1. Crie uma aplicação do tipo **Single Page Application**.
2. Cadastre a URL da Vercel em **Allowed Callback URLs**.
3. Cadastre a URL da Vercel em **Allowed Logout URLs**.
4. Cadastre a URL da Vercel em **Allowed Web Origins**.
5. Crie uma API com a mesma audience usada em `AUTH0_AUDIENCE`.
6. Configure uma Action ou regra que inclua a claim `https://agrohero.app/roles` no access token.
7. Use somente os papéis `consumer`, `farmer` e `admin`.

O backend valida issuer, audience, assinatura, expiração e papel do token. Não use o papel enviado pelo navegador para autorizar operações administrativas.

## 4. Deploy do frontend na Vercel

1. Acesse a [Vercel](https://vercel.com) e importe o repositório.
2. Defina **Root Directory** como `agrohero-toledo-deploy`.
3. Use:
   - Framework: `Vite`;
   - Build Command: `npm run build`;
   - Output Directory: `dist`.
4. Configure as variáveis públicas:

```env
VITE_API_URL=https://<sua-api>.onrender.com
VITE_AUTH0_DOMAIN=<seu-tenant>.us.auth0.com
VITE_AUTH0_CLIENT_ID=<client-id>
VITE_AUTH0_AUDIENCE=https://api.agrohero.app
```

O `vercel.json` contém o rewrite da SPA para permitir refresh em rotas como `/receitas`, `/produtor` e `/produto/:id`.

## 5. Política de pagamento no local

Não há gateway de pagamento online. O cliente finaliza o pedido na aplicação e paga presencialmente:

1. O frontend consulta `GET /api/payment-methods` para exibir as formas aceitas.
2. O pedido é enviado por `POST /api/orders` com `paymentStatus: pending_on_pickup`.
3. O produtor recebe o pedido e cobra no ponto de retirada ou na entrega, via PIX, cartão ou dinheiro.

O frontend nunca coleta número de cartão, CVV ou código PIX. A aplicação não recebe nem armazena dados financeiros.

## 5.1. Notificações por e-mail do pedido

`POST /api/orders` envia e-mails transacionais via `mailer.ts` (nodemailer), de forma best-effort — falha de SMTP não desfaz o pedido salvo.

Configure no Render as variáveis `SMTP_HOST`, `SMTP_PORT` (587 com STARTTLS), `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` e `APP_URL`. Sem elas o pedido continua sendo aceito e nenhum e-mail é enviado.

- Cliente: confirmação da compra com resumo, total e ponto de retirada, enviada para `customerEmail`.
- Produtores: aviso para preparar os produtos, agrupado por produtor.
- O destinatário do produtor vem do catálogo do servidor (resolvido por `productId`), não do payload do cliente.

`tests/orders-email.test.ts` sobe um servidor SMTP local e valida as mensagens entregues.

## 6. Validação pós-deploy

Na pasta `agrohero-toledo-deploy`, execute antes de publicar alterações:

```bash
npm install
npm run lint
npm run build
npm test
npm audit --audit-level=high
```

Depois valide:

1. `GET /api/health` retorna banco disponível.
2. O frontend carrega produtos pela API.
3. A rota `/produtor` bloqueia consumidores.
4. O login redireciona para Auth0 quando configurado.
5. `GET /api/payment-methods` retorna a política presencial e as formas aceitas.
6. `POST /api/orders` cria o pedido com `paymentStatus: pending_on_pickup`.
7. `POST /api/orders` com `paymentStatus: paid` retorna erro `400`.
8. Com SMTP configurado, o cliente e os produtores recebem os e-mails; a resposta de `POST /api/orders` traz `emailNotification: "sent"`.

## 7. Limitações e segurança

- Sem as variáveis de Auth0, as rotas protegidas permanecem indisponíveis.
- Sem Auth0, o painel do produtor fica indisponível; o registro de pedidos continua funcionando.
- Segredos devem ser configurados apenas no Render ou em variáveis locais não versionadas.
- O uso de PostgreSQL e Auth0 requer políticas operacionais próprias, incluindo retenção de dados, gestão de acesso e monitoramento.
- Os testes automatizados apoiam a conformidade técnica, mas não substituem auditoria jurídica ou avaliação formal da LGPD.
