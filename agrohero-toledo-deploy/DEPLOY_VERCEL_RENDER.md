# Deploy do Agro Hero Toledo

Este projeto utiliza uma arquitetura separada:

- **Vercel:** frontend React/Vite.
- **Render:** API Node.js/Express.
- **Render PostgreSQL:** persistência de produtos, usuários e pedidos.
- **Auth0:** autenticação e autorização por papéis.
- **Mercado Pago:** checkout externo para PIX e cartão.

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
MERCADOPAGO_ACCESS_TOKEN=<token privado>
MERCADOPAGO_WEBHOOK_SECRET=<segredo do webhook>
CHECKOUT_BASE_URL=https://<seu-projeto>.vercel.app
```

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

## 5. Configuração do Mercado Pago

1. Crie ou utilize uma aplicação no Mercado Pago.
2. Gere um access token de teste para homologação.
3. Configure `MERCADOPAGO_ACCESS_TOKEN` somente no Render.
4. Configure o segredo de assinatura em `MERCADOPAGO_WEBHOOK_SECRET`.
5. Cadastre o endpoint:

```text
https://<sua-api>.onrender.com/api/payments/webhook
```

O frontend não coleta número completo de cartão ou CVV. O backend cria uma preferência e redireciona o usuário para o checkout hospedado.

O pedido não deve ser considerado pago apenas pelo retorno do navegador. A confirmação deve ocorrer por webhook validado.

## 6. Validação pós-deploy

Na pasta `agrohero-toledo-deploy`, execute antes de publicar alterações:

```bash
npm install
npm run lint
npm run build
npm run test:security
npm audit --audit-level=high
```

Depois valide:

1. `GET /api/health` retorna banco disponível.
2. O frontend carrega produtos pela API.
3. A rota `/produtor` bloqueia consumidores.
4. O login redireciona para Auth0 quando configurado.
5. O checkout redireciona para o Mercado Pago.
6. O webhook inválido retorna erro `400` ou `401`.
7. O webhook válido retorna `202`.

## 7. Limitações e segurança

- Sem as variáveis de Auth0, as rotas protegidas permanecem indisponíveis.
- Sem as credenciais do Mercado Pago, o checkout não confirma pagamento.
- Segredos devem ser configurados apenas no Render ou em variáveis locais não versionadas.
- O uso de PostgreSQL, Auth0 e Mercado Pago requer políticas operacionais próprias, incluindo retenção de dados, gestão de acesso e monitoramento.
- Os testes automatizados apoiam a conformidade técnica, mas não substituem auditoria jurídica, LGPD ou PCI-DSS.
