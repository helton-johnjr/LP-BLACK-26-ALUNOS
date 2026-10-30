# Contrato de dataLayer para o GTM (vale para qualquer LP)

O container **GTM-TC2WPHZ9** não depende de seletores do formulário. Toda LP nova só precisa:

1. Instalar o snippet do GTM (head + noscript).
2. Quando o lead for **confirmado** (depois do webhook responder 2xx), fazer este push:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'generate_lead',              // obrigatório, nome exato
  form_id: 'sk-bfXX-captura-xxx',      // identifica a LP/formulário
  form_local: 'topo',                  // opcional: qual formulário da página
  user_data: {
    email_address: 'pessoa@email.com', // minúsculo, sem espaços
    phone_number: '+5511912345678',    // E.164 com +55
    address: {                         // opcional, só se a LP tiver campo de nome
      first_name: 'Maria',
      last_name: 'Silva'
    }
  }
});
```

Não chame `fbq('track','Lead')` nem `gtag('event','generate_lead')` na página. O GTM dispara:
Meta Lead (navegador), GA4 Lead (via server) e Meta Lead (API de Conversões), todos com o mesmo `event_id`.

## O que o GTM faz com isso
- Gatilho: evento personalizado `generate_lead` (qualquer LP, sem filtro de domínio).
- Variáveis `📝 [DLV][LEAD] ...` leem `user_data.*`. Se a LP esquecer de mandar, as variáveis
  `☕ [JAVA SCRIPT] Email / Telefone / Nome / Sobrenome` tentam achar campos comuns no DOM
  (`type=email`, `type=tel`, `name` com "nome"/"name") e, por último, o cookie do último lead.
- UTMs: salvas em cookie no carregamento da página (qualquer LP), sem depender de formulário.

## Checklist para uma LP nova
- [ ] Snippet do GTM no `<head>` e `<noscript>` no `<body>`, em todas as páginas
- [ ] Push `generate_lead` com `user_data` só após o sucesso do envio
- [ ] Nenhuma chamada direta a `fbq`/`gtag`
- [ ] Testar no Preview: `generate_lead` aparece 1x, Meta Lead e GA4 Lead disparam, `em`/`ph` chegam preenchidos
