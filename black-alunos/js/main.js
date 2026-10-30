const ENDPOINT = 'https://n8n.grupohbdigital.com.br/webhook/black-alunos';
const GRUPO_VIP = 'https://sndflw.com/i/fBWWum8QlKtHc04hMk80';
const REVELACAO = '2026-10-26T20:00:00-03:00';
const DESTINO_SUCESSO = '/black-alunos/obrigado'; // página de obrigado (Vercel cleanUrls)
const FORM_ID = 'sk-bf26-captura-alunos';
const FORM_NOME = 'Black Contábil Vitalícia | Captura Alunos';
const FUSO = 'America/Sao_Paulo'; // data e hora do lead no horário de Brasília

document.documentElement.classList.add('js');

const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Contador (barra, seção 8 e qualquer [data-countdown]) ---------- */
const ALVO = new Date(REVELACAO).getTime();
let contadorId = null;

function tempoRestante() {
  const ms = Math.max(0, ALVO - Date.now());
  return {
    ms,
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

function renderContador() {
  const t = tempoRestante();
  document.querySelectorAll('[data-countdown] [data-cd]').forEach((slot) => {
    slot.textContent = String(t[slot.dataset.cd]).padStart(2, '0');
  });

  if (t.ms > 0) return true;

  document.querySelectorAll('[data-countdown-wrap]').forEach((wrap) => {
    wrap.querySelectorAll('[data-cd-running]').forEach((el) => { el.hidden = true; });
    wrap.querySelectorAll('[data-cd-done]').forEach((el) => { el.hidden = false; });
  });
  clearInterval(contadorId);
  // [FALTA: destino da página depois de 26/10 às 20h]
  // location.replace('URL_DA_PAGINA_DA_OFERTA');
  return false;
}

/* ---------- Reveal no scroll (seções 3 a 8) ---------- */
function iniciarReveal() {
  const itens = document.querySelectorAll('.reveal');
  if (reduzMovimento || !('IntersectionObserver' in window)) {
    itens.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    const lote = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    const temCabecalho = lote.some((el) => el.dataset.reveal !== 'item');
    let cards = 0;

    lote.forEach((el) => {
      let atraso = 0;
      if (el.dataset.reveal === 'sub') atraso = 80;
      if (el.dataset.reveal === 'item') {
        atraso = Math.min((temCabecalho ? 160 : 0) + cards * 60, 400);
        cards += 1;
      }
      el.style.transitionDelay = `${atraso}ms`;
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  itens.forEach((el) => io.observe(el));
}

/* ---------- Formulários ---------- */
const MENSAGENS = {
  email: 'Confere o e-mail? Parece que falta alguma coisa.',
  whatsapp: 'Digite o WhatsApp com DDD, só números: (11) 91234-5678.',
  envio: 'Não consegui enviar agora. Tenta de novo em instantes.',
};

function digitosWhatsApp(valor) {
  let d = valor.replace(/\D/g, '');
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  return d.slice(0, 11);
}

function mascararWhatsApp(valor) {
  const d = digitosWhatsApp(valor);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());

function whatsappValido(valor) {
  const d = digitosWhatsApp(valor);
  const ddd = Number(d.slice(0, 2));
  return d.length === 11 && ddd >= 11 && ddd <= 99 && d[2] === '9';
}

function marcarErro(input, mensagem) {
  input.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  const erro = document.getElementById(input.getAttribute('aria-describedby'));
  if (erro) erro.textContent = mensagem || '';
}

/* ---------- Rastreio: todas as utm_* e ids de clique dos anúncios ---------- */
// mesmo formato da página de não alunos: estas chaves vão sempre no payload (vazias se não vierem),
// e qualquer outra utm_* que vier na URL (utm_adset...) entra também
const RASTREIO_FIXO = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'src', 'sck',
];
const CHAVE_RASTREIO = 'sk-bf26-rastreio';
const VALIDADE_RASTREIO = 30 * 86400000; // 30 dias

function rastreioDaUrl() {
  const achados = {};
  new URLSearchParams(window.location.search).forEach((valor, chave) => {
    const nome = chave.toLowerCase();
    if (valor && (nome.startsWith('utm_') || RASTREIO_FIXO.includes(nome))) achados[nome] = valor;
  });
  return achados;
}

// a URL atual manda; sem nada na URL, vale o último rastreio salvo (quem saiu e voltou depois)
function lerRastreio() {
  let rastreio = rastreioDaUrl();
  try {
    if (Object.keys(rastreio).length) {
      localStorage.setItem(CHAVE_RASTREIO, JSON.stringify({ salvo_em: Date.now(), rastreio }));
    } else {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_RASTREIO));
      if (salvo && Date.now() - salvo.salvo_em < VALIDADE_RASTREIO) rastreio = salvo.rastreio;
    }
  } catch (erro) { /* sem storage: fica só com o que veio na URL */ }
  return rastreio;
}

function lerUtms() {
  const vazios = Object.fromEntries(RASTREIO_FIXO.map((chave) => [chave, '']));
  return { ...vazios, ...lerRastreio() };
}

/* ---------- Dados do lead para o GTM (contrato user_data) ---------- */
// Padrão para TODAS as LPs: o GTM lê estes campos do dataLayer (user_data.*) e não depende mais
// de seletores do DOM. Veja GTM-CONTRATO-DATALAYER.md.
function montarUserData(form) {
  const campo = (nome) => form.querySelector(`[name="${nome}"]`);
  const email = campo('email');
  const whatsapp = campo('whatsapp');
  const nome = campo('nome'); // opcional: só existe em LPs com campo de nome
  const userData = {};
  if (email && email.value.trim()) userData.email_address = email.value.trim().toLowerCase();
  const tel = whatsapp ? digitosWhatsApp(whatsapp.value) : '';
  if (tel) userData.phone_number = `+55${tel}`;
  if (nome && nome.value.trim()) {
    const partes = nome.value.trim().split(/\s+/);
    userData.address = { first_name: partes[0] };
    if (partes.length > 1) userData.address.last_name = partes[partes.length - 1];
  }
  return userData;
}

function iniciarFormulario(form) {
  const card = form.closest('[data-form-card]');
  const email = form.querySelector('[name="email"]');
  const whatsapp = form.querySelector('[name="whatsapp"]');
  const honeypot = form.querySelector('[name="website"]');
  const botao = form.querySelector('[data-submit]');
  const rotulo = form.querySelector('[data-submit-label]');
  const status = form.querySelector('[data-status]');
  const sucesso = card.querySelector('[data-success]');
  const textoBotao = rotulo.textContent;

  whatsapp.addEventListener('input', () => {
    whatsapp.value = mascararWhatsApp(whatsapp.value);
    if (whatsapp.getAttribute('aria-invalid') === 'true' && whatsappValido(whatsapp.value)) marcarErro(whatsapp, '');
  });
  email.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') === 'true' && emailValido(email.value)) marcarErro(email, '');
  });
  email.addEventListener('blur', () => {
    if (email.value.trim()) marcarErro(email, emailValido(email.value) ? '' : MENSAGENS.email);
  });
  whatsapp.addEventListener('blur', () => {
    if (whatsapp.value) marcarErro(whatsapp, whatsappValido(whatsapp.value) ? '' : MENSAGENS.whatsapp);
  });

  function destravarBotao() {
    botao.disabled = false;
    botao.removeAttribute('aria-busy');
    rotulo.textContent = textoBotao;
    botao.style.width = '';
  }

  function mostrarSucesso() {
    form.hidden = true;
    sucesso.hidden = false;
    sucesso.querySelector('[data-success-title]').focus({ preventScroll: true });
    // O Pixel da Meta NÃO é chamado aqui: o GTM dispara o Lead (navegador + servidor, com o mesmo event_id).
    // Chamar fbq direto geraria um Lead duplicado, sem event_id, que a Meta não consegue deduplicar.
    // Evento de conversão para o GTM (GTM-TC2WPHZ9): só depois que o webhook respondeu 2xx.
    (window.dataLayer = window.dataLayer || []).push({
      event: 'generate_lead',
      form_id: FORM_ID,
      form_nome: FORM_NOME,
      form_local: form.dataset.form,
      page_url: window.location.href,
      user_data: montarUserData(form),
      ...lerUtms(),
    });
    // o lead segue para a página de obrigado, que leva ao grupo
    setTimeout(() => { window.location.href = DESTINO_SUCESSO; }, 1500);
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (botao.disabled) return;
    status.textContent = '';

    const okEmail = emailValido(email.value);
    const okWhatsApp = whatsappValido(whatsapp.value);
    marcarErro(email, okEmail ? '' : MENSAGENS.email);
    marcarErro(whatsapp, okWhatsApp ? '' : MENSAGENS.whatsapp);
    if (!okEmail) { email.focus(); return; }
    if (!okWhatsApp) { whatsapp.focus(); return; }
    if (honeypot && honeypot.value) return;

    botao.style.width = `${botao.offsetWidth}px`;
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    rotulo.textContent = 'ENVIANDO…';

    const agora = new Date();
    const payload = {
      email: email.value.trim(),
      whatsapp: `55${digitosWhatsApp(whatsapp.value)}`,
      form_id: FORM_ID,
      form_nome: FORM_NOME,
      form_local: form.dataset.form, // qual dos dois formulários da página: topo ou final
      data: agora.toLocaleDateString('pt-BR', { timeZone: FUSO }),
      hora: agora.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour12: false }),
      enviado_em: agora.toISOString(),
      page_url: window.location.href,
      origem: FORM_ID,               // campos antigos, mantidos para não quebrar o que já lê "origem" e "url"
      url: window.location.href,
      ...lerUtms(),
    };

    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 15000);
    try {
      const resposta = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controle.signal,
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      mostrarSucesso();
    } catch (erro) {
      status.textContent = MENSAGENS.envio;
      destravarBotao();
    } finally {
      clearTimeout(limite);
    }
  });
}

/* ---------- CTA fixo mobile ---------- */
function iniciarCtaFixo() {
  const barra = document.querySelector('[data-sticky-cta]');
  const cardHero = document.getElementById('form-hero');
  const cardFinal = document.getElementById('form-final');
  if (!barra || !cardHero || !cardFinal || !('IntersectionObserver' in window)) return;

  const mobile = window.matchMedia('(max-width: 640px)');
  const estado = { heroNaTela: true, heroPassou: false, finalNaTela: false };

  const atualizar = () => {
    // fica visível desde o carregamento; só sai de cena quando o formulário final aparece
    const mostrar = mobile.matches && !estado.finalNaTela;
    barra.classList.toggle('is-visible', mostrar);
    barra.inert = !mostrar;
    barra.setAttribute('aria-hidden', String(!mostrar));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target === cardHero) {
        estado.heroNaTela = e.isIntersecting;
        estado.heroPassou = !e.isIntersecting && e.boundingClientRect.top < 0;
      } else {
        estado.finalNaTela = e.isIntersecting;
      }
    });
    atualizar();
  });
  io.observe(cardHero);
  io.observe(cardFinal);
  mobile.addEventListener('change', atualizar);

  barra.querySelector('button').addEventListener('click', () => {
    cardHero.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center' });
    const email = cardHero.querySelector('[name="email"]');
    if (email && !email.closest('form').hidden) email.focus({ preventScroll: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (renderContador()) contadorId = setInterval(renderContador, 1000);
  document.querySelectorAll('[data-group-link]').forEach((link) => { link.href = GRUPO_VIP; });
  document.querySelectorAll('[data-form]').forEach(iniciarFormulario);
  iniciarReveal();
  iniciarCtaFixo();
});
