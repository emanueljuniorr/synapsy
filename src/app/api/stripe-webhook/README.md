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

## Solução de Problemas

### Erros de Stream e WebSocket

Os erros relacionados a `Stream is already ended` ou `TypeError: undefined is not an object (evaluating 'this.#state')` geralmente ocorrem quando há problemas com a forma como o Next.js lida com respostas assíncronas em webhooks.

Como solução, implementamos:

1. **Resposta imediata**: O webhook retorna uma resposta HTTP 200 imediatamente para a Stripe, antes de processar o evento.

2. **Processamento assíncrono**: Os eventos são processados depois que a resposta já foi enviada, evitando que operações demoradas causem timeouts.

3. **Runtime Node.js**: Usamos `export const runtime = 'nodejs'` para garantir que o webhook seja executado no ambiente Node.js e não no Edge Runtime, evitando problemas de compatibilidade.

4. **Promise.all para operações em lote**: Para operações em lote (como atualizar vários usuários), usamos `Promise.all()` para aguardar a conclusão de todas as operações assíncronas.

Se você encontrar erros, verifique:

- Se as variáveis de ambiente estão configuradas corretamente
- Se o servidor tem tempo suficiente para processar os eventos antes de encerrar
- Se há erros no console relacionados à conexão com o Firestore
- Se a versão da API da Stripe está compatível com o código 