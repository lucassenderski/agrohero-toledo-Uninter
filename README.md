# Agro Hero Toledo

Este repositório contém a aplicação web Agro Hero Toledo, voltada à conexão entre agricultores familiares, consumidores e iniciativas de produção sustentável em Toledo, Paraná.

O projeto está localizado na pasta [agrohero-toledo-deploy](agrohero-toledo-deploy/). A documentação técnica, os comandos de execução e as variáveis de ambiente estão disponíveis no [README principal da aplicação](agrohero-toledo-deploy/README.md).

Para iniciar o projeto:

```bash
cd agrohero-toledo-deploy
npm install
npm run dev
```

O backend roda separadamente:

```bash
RUN_SERVER=1 npm run start:server
```

## Pagamento

Não há gateway de pagamento online. O cliente finaliza o pedido e paga presencialmente no local de retirada ou entrega, via PIX, cartão ou dinheiro. Nenhum dado de cartão ou código PIX é coletado pela aplicação.

## Notificações por e-mail

Na confirmação do pedido, o cliente recebe um e-mail com o resumo da compra e cada produtor envolvido recebe um aviso para preparar os produtos. O envio depende das variáveis `SMTP_*` e é best-effort: sem SMTP configurado o pedido é aceito normalmente.

As instruções de implantação em Vercel e Render estão em [DEPLOY_VERCEL_RENDER.md](agrohero-toledo-deploy/DEPLOY_VERCEL_RENDER.md).
