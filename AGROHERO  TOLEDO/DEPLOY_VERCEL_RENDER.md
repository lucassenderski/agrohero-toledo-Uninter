# Guia de Deploy Agro Hero: Vercel (Frontend) + Render (Backend)

Este guia orienta o deploy desacoplado e escalável da plataforma **Agro Hero**:
- **Frontend SPA**: Hospedado na **Vercel** (Global Edge CDN, carregamento ultrarrápido).
- **Backend API**: Hospedado no **Render** (Node.js/Express + PostgreSQL gerenciado).

---

## 1. Deploy do Frontend na Vercel

O arquivo `vercel.json` já está configurado na raiz do projeto para roteamento SPA e cabeçalhos de segurança.

### Passo a Passo:
1. Suba este repositório para o seu GitHub (ex: `github.com/seu-usuario/agro-hero`).
2. Acesse o painel da [Vercel](https://vercel.com) e clique em **Add New... > Project**.
3. Importe o repositório do **Agro Hero**.
4. Configure os parâmetros do projeto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Variáveis de Ambiente (Environment Variables):
   - `VITE_API_URL`: URL do seu backend no Render (ex: `https://agro-hero-api.onrender.com`).
6. Clique em **Deploy**. Em menos de 1 minuto seu frontend estará no ar com HTTPS e CDN mundial.

---

## 2. Deploy do Backend e Banco PostgreSQL no Render

O arquivo `render.yaml` na raiz permite criar a infraestrutura automaticamente através do recurso **Blueprints** do Render.

### Passo a Passo:
1. Acesse o painel do [Render](https://render.com).
2. Clique em **New + > Blueprint**.
3. Conecte seu repositório do GitHub. O Render detectará automaticamente o arquivo `render.yaml` e provisionará:
   - Um **Web Service** Node.js (`agro-hero-api`).
   - Um banco de dados **PostgreSQL** (`agro-hero-db`).
4. Parâmetros configurados:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:server`
   - **Health Check Path**: `/api/health`
5. Variáveis de Ambiente no Render:
   - `PORT`: `10000` (padrão Render)
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Injetado automaticamente pelo Render Blueprint
   - `CORS_ORIGIN`: URL gerada pela Vercel (ex: `https://agro-hero.vercel.app`)
6. Clique em **Apply**. O Render iniciará a compilação e o monitoramento de saúde em `/api/health`.

---

## 3. Arquitetura de Segurança no Cadastro de Usuários e Produtores

A segurança do cadastro e autenticação dos agricultores e consumidores baseia-se em 5 pilares:
1. **Identidade Federada e RBAC (Auth0 / OpenID Connect)**:
   - As credenciais nunca ficam expostas ou salvas em texto puro.
   - Segregação estrita de privilégios entre Consumidores e Produtores Familiares.
2. **Criptografia de Ponta a Ponta**:
   - Tráfego 100% criptografado com TLS 1.3 tanto na Vercel quanto no Render.
   - Senhas protegidas com hashing moderno (Argon2 / bcrypt) e salting individual.
3. **Conformidade com a LGPD (Lei nº 13.709/2018)**:
   - Coleta mínima de dados (princípio da necessidade).
   - Dados de produtores (como DAP/CAF) são validados e mantidos isolados para fins exclusivos de auditoria agroecológica.
4. **Proteção de Pagamentos**:
   - PIX gerado via API do Banco Central sem armazenamento de dados bancários sensíveis na aplicação.
   - Cartões tokenizados com conformidade PCI-DSS.
