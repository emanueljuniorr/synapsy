# Configuração do Webhook da Stripe

Este diretório contém a implementação do webhook da Stripe para processar eventos de pagamento e assinatura.

## Configuração no Painel da Stripe

1. Acesse o [Painel da Stripe](https://dashboard.stripe.com/)
2. Vá para **Developers** > **Webhooks**
3. Clique em **Add endpoint**
4. Na URL do endpoint, insira:
   - Para ambiente de produção: `https://seu-dominio.com/api/stripe-webhook`
   - Para ambiente de desenvolvimento: Use o serviço [Stripe CLI](https://stripe.com/docs/stripe-cli) ou uma ferramenta como [ngrok](https://ngrok.com/) para encaminhar eventos para `http://localhost:3000/api/stripe-webhook`
5. Em **Eventos a serem enviados**, selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Configuração das Variáveis de Ambiente

Certifique-se de que as seguintes variáveis de ambiente estejam configuradas:

```
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

- O `NEXT_PUBLIC_STRIPE_SECRET_KEY` é a chave secreta da API encontrada no painel da Stripe
- O `STRIPE_WEBHOOK_SECRET` é o segredo do webhook fornecido pela Stripe quando você configura um endpoint
- O `NEXT_PUBLIC_APP_URL` é o URL base do seu aplicativo

## Testes com o Stripe CLI

Para testar o webhook localmente:

1. Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Execute o login no CLI: `stripe login`
3. Inicie o encaminhamento do webhook: `stripe listen --forward-to http://localhost:3000/api/stripe-webhook`
4. Em outra janela de terminal, simule um evento: `stripe trigger checkout.session.completed`

## Manipulação de Eventos

O webhook processa os seguintes eventos:

- `checkout.session.completed`: Quando um pagamento é concluído com sucesso
- `customer.subscription.updated`: Quando uma assinatura é atualizada
- `customer.subscription.deleted`: Quando uma assinatura é cancelada
- `invoice.payment_succeeded`: Quando uma fatura é paga com sucesso
- `invoice.payment_failed`: Quando o pagamento de uma fatura falha

Cada evento atualiza o status do plano do usuário correspondente no Firestore.
