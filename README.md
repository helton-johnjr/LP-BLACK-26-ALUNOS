# Black Contábil Vitalícia — Página de captura (alunos)

Página estática (HTML + CSS + JS puro, sem dependências nem build) para levar alunos da
Professora Stephanie Kalynka ao Grupo VIP do WhatsApp antes da revelação da oferta em
**07/10/2026 às 20h (Brasília)**.

## Estrutura

```
index.html            página
css/tokens.css        cores, tipografia, espaçamentos
css/base.css          reset, botão, campos, selo
css/sections.css      layout de cada seção
css/effects.css       animações + bloco prefers-reduced-motion
js/config.js          ← TUDO que precisa ser preenchido fica aqui
js/main.js            inicializa os módulos
js/countdown.js       contador (barra fixa + contador grande)
js/form.js            validação, máscara, envio ao webhook, redirecionamento
js/effects.js         reveal no scroll, spotlight, preço embaralhado, botão flutuante
js/analytics.js       Meta Pixel e GA4 (só carregam com ID preenchido)
assets/img/           hero-desktop-v2.webp, hero-mobile.webp, logo, favicon
og-image.jpg          imagem de compartilhamento (1200×630)
vercel.json           cache e headers de segurança
```

## O que preencher antes de publicar

| O quê | Onde | Observação |
|---|---|---|
| Link do grupo VIP | `js/config.js` → `WHATSAPP_GROUP_URL` | Ex.: `https://chat.whatsapp.com/...` |
| Webhook da ferramenta de e-mail/CRM | `js/config.js` → `WEBHOOK_URL` | Enquanto tiver `[FALTA`, o envio é pulado (modo teste) |
| Meta Pixel | `js/config.js` → `META_PIXEL_ID` | Vazio = não carrega |
| Google Analytics 4 | `js/config.js` → `GA4_ID` | Vazio = não carrega |
| Data da revelação | `js/config.js` → `REVEAL_DATE` | Mantenha o `-03:00` no final |
| Domínio final | `index.html` → `og:url`, `og:image`, `twitter:image` | Troque `[FALTA: domínio final]` |
| Política de privacidade | `index.html` → link no rodapé | Troque `[FALTA: URL da política de privacidade]` |

### O que o webhook recebe

`POST` com `Content-Type: application/json`:

```json
{
  "email": "aluna@exemplo.com",
  "whatsapp": "5511912345678",
  "origem": "sk-bf26-captura-alunos",
  "data_hora": "2026-09-15T18:17:31.016Z",
  "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_content": "", "utm_term": ""
}
```

- Timeout de 4s. Se o webhook falhar, demorar ou responder erro, **a pessoa é levada ao grupo mesmo assim** e o erro aparece no console.
- O navegador faz uma requisição de verificação (CORS) antes do POST JSON. Se a sua ferramenta não aceitar
  requisições vindas do navegador, o erro aparece no console como falha de CORS. Nesse caso, em `js/form.js`,
  troque o header para `"Content-Type": "text/plain;charset=UTF-8"` (o corpo continua sendo JSON) e teste de novo.

## Ver localmente

Dá para abrir o `index.html` com dois cliques: a página inteira, o contador e a validação funcionam.
Para testar o envio real ao webhook, use um servidor local (a partir do arquivo o navegador envia
a origem como `null`, e muitas ferramentas recusam):

```bash
python -m http.server 5173
```

Depois abra `http://localhost:5173`.

## Deploy (GitHub + Vercel)

1. **Criar o repositório** no GitHub (privado), sem README.
2. **Enviar o código** a partir desta pasta:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git branch -M main
   git push -u origin main
   ```
3. **Importar na Vercel**: *Add New → Project* → escolha o repositório →
   Framework Preset **Other**, Build Command **vazio**, Output Directory **vazio** (raiz) → *Deploy*.
4. **Preencher `js/config.js`** (tabela acima) e o domínio/política no `index.html`, fazer commit e push.
   A Vercel publica sozinha a cada push.
5. **Testar em produção**:
   - abra a página com `?utm_source=teste&utm_campaign=teste`;
   - envie o formulário com seus dados → deve ir para o grupo;
   - confira na ferramenta de e-mail/CRM se o lead chegou com as UTMs;
   - com o Pixel/GA preenchidos, confira os eventos `Lead` e `generate_lead`;
   - compartilhe o link no WhatsApp e confira a imagem de prévia.

## Observações

- **Cache das imagens:** `/assets/*` é servido com cache de 1 ano (`immutable`). Se trocar uma imagem,
  **mude o nome do arquivo** (ex.: `hero-desktop-v2.webp`) e atualize a referência no HTML/CSS.
- **Busca:** a página tem `noindex, nofollow`. Para liberar a indexação, apague a meta `robots` no `index.html`.
- **Depois de 07/10 às 20h** os contadores são trocados por "A OFERTA FOI REVELADA — ENTRE NO GRUPO AGORA".
- **Movimento reduzido:** com `prefers-reduced-motion` ativo, a página fica estática (sem partículas,
  holofotes, shimmer ou embaralhamento).
