# SK BF26 | Página de Captura alunos — Black Contábil Vitalícia

Página estática. Não precisa de build no deploy: o CSS já está compilado em `css/styles.css`.
Página de base própria, com `noindex` (meta, header `X-Robots-Tag` e `robots.txt`).

## 1. Subir no GitHub

    git init
    git add .
    git commit -m "primeira versão"
    git branch -M main
    git remote add origin https://github.com/<usuario>/<repo>.git
    git push -u origin main

## 2. Publicar na Vercel

1. vercel.com → Add New → Project → importe o repositório.
2. Framework Preset: **Other**. Build Command: deixe vazio. Output Directory: deixe vazio (raiz).
3. Deploy. O domínio `.vercel.app` sai em segundos.
4. Domínio próprio: Settings → Domains → adicione e aponte o DNS conforme a instrução da tela.

## 3. O que trocar e onde

| O quê | Onde |
|---|---|
| Destino do formulário (webhook) | `js/main.js`, linha 1: `const ENDPOINT = '...'` |
| Link do Grupo VIP do WhatsApp | `js/main.js`, linha 2: `const GRUPO_VIP = '...'` |
| Data e hora da revelação | `js/main.js`, linha 3: `const REVELACAO = '2026-10-26T20:00:00-03:00'` |
| Destino depois do cadastro | `js/main.js`, linha 4: `const DESTINO_SUCESSO = 'obrigado'` |
| Destino da página depois da revelação | `js/main.js`, função `renderContador`, comentário `location.replace(...)` |
| Rodapé (razão social, CNPJ, política, contato) | `index.html`, bloco `<!-- 9-rodape -->` |
| URL da política de privacidade (microcópia) | `index.html`, `<a class="form__link" href="#">` nos dois formulários |
| Domínio | `index.html`, `<head>`: `canonical`, `og:url` e `og:image` (`SEU-DOMINIO.com.br`) |
| Cores e fontes | `src/input.css`, bloco `:root` (depois recompile) |

O webhook recebe `POST` com `Content-Type: application/json` e precisa aceitar CORS do seu domínio
(responder ao `OPTIONS`). Qualquer resposta fora de 2xx mostra a mensagem de erro no formulário.

Payload enviado:

```json
{
  "email": "aluna@email.com",
  "whatsapp": "5511912345678",
  "origem": "sk-bf26-captura-alunos",
  "url": "https://.../?utm_source=...",
  "enviado_em": "2026-09-20T13:00:00.000Z",
  "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_content": "", "utm_term": ""
}
```

O Meta Pixel não vem instalado. Se você instalar, o evento `Lead` já dispara no sucesso.

## 4. Recompilar o CSS

Depois de mexer em `index.html`, `design-system.html` ou `src/input.css`:

    npm install && npm run build

Tudo marcado com `[REVISAR]` ou `[FALTA: ...]` no HTML e no JS precisa da sua conferência antes de anunciar.
