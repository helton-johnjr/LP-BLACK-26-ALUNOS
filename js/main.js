const ENDPOINT = 'https://n8n.grupohbdigital.com.br/webhook/f1b7ec83-db8e-47d1-b898-425f9fe074e2';
const GRUPO_VIP = 'https://sndflw.com/i/fBWWum8QlKtHc04hMk80';
const REVELACAO = '2026-10-26T20:00:00-03:00';
const DESTINO_SUCESSO = 'obrigado'; // página de obrigado (Vercel cleanUrls)

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

function lerUtms() {
  const params = new URLSearchParams(window.location.search);
  return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .reduce((acc, chave) => ({ ...acc, [chave]: params.get(chave) || '' }), {});
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
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
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

    const payload = {
      email: email.value.trim(),
      whatsapp: `55${digitosWhatsApp(whatsapp.value)}`,
      origem: 'sk-bf26-captura-alunos',
      url: window.location.href,
      enviado_em: new Date().toISOString(),
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
    const mostrar = mobile.matches && estado.heroPassou && !estado.heroNaTela && !estado.finalNaTela;
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
