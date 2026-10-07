window.LP_FORM = (function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function onlyDigits(str) {
    return (str || "").replace(/\D/g, "");
  }

  function maskWhatsapp(value) {
    var d = onlyDigits(value).slice(0, 11);
    if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
    if (d.length > 6) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
    if (d.length > 2) return d.replace(/(\d{2})(\d{0,5})/, "($1) $2").trim();
    if (d.length > 0) return "(" + d;
    return "";
  }

  function getUtms() {
    var params = new URLSearchParams(window.location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var out = {};
    keys.forEach(function (k) { out[k] = params.get(k) || ""; });
    return out;
  }

  function setError(field, input, msg) {
    var errorEl = document.getElementById(input.getAttribute("aria-describedby"));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (errorEl) errorEl.textContent = msg || "";
  }

  function validate(form) {
    var email = form.querySelector("#lead-email");
    var whats = form.querySelector("#lead-whatsapp");
    var ok = true;

    if (!EMAIL_RE.test(email.value.trim())) {
      setError(null, email, "Digite um e-mail válido.");
      ok = false;
    } else {
      setError(null, email, "");
    }

    var digits = onlyDigits(whats.value);
    if (digits.length < 10) {
      setError(null, whats, "Digite um WhatsApp válido com DDD.");
      ok = false;
    } else {
      setError(null, whats, "");
    }

    return ok;
  }

  function redirect() {
    var cfg = window.LP_CONFIG || {};
    if (cfg.WHATSAPP_GROUP_URL) window.location.href = cfg.WHATSAPP_GROUP_URL;
  }

  function submitLead(form) {
    var cfg = window.LP_CONFIG || {};
    var email = form.querySelector("#lead-email").value.trim();
    var whatsDigits = onlyDigits(form.querySelector("#lead-whatsapp").value);
    var whatsapp = whatsDigits.length <= 11 ? "55" + whatsDigits : whatsDigits;

    var payload = Object.assign(
      {
        email: email,
        whatsapp: whatsapp,
        origem: cfg.ORIGEM || "sk-bf26-captura-alunos",
        data_hora: new Date().toISOString(),
      },
      getUtms()
    );

    if (window.LP_ANALYTICS) window.LP_ANALYTICS.trackLead(payload);

    if (!cfg.WEBHOOK_URL || cfg.WEBHOOK_URL.indexOf("[FALTA") === 0) {
      return Promise.resolve();
    }

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? window.setTimeout(function () { controller.abort(); }, 4000) : null;

    return fetch(cfg.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined,
    })
      .catch(function (err) {
        console.error("Falha ao enviar lead ao webhook:", err);
      })
      .then(function () {
        if (timeoutId) window.clearTimeout(timeoutId);
      });
  }

  function init() {
    var form = document.querySelector("[data-lead-form]");
    if (!form) return;

    var submitBtn = form.querySelector("[data-submit]");
    var statusEl = form.querySelector("[data-form-status]");
    var whats = form.querySelector("#lead-whatsapp");

    whats.addEventListener("input", function () {
      whats.value = maskWhatsapp(whats.value);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var honeypot = form.querySelector("#lead-website");
      if (honeypot && honeypot.value) return;

      if (!validate(form)) return;

      submitBtn.setAttribute("disabled", "disabled");
      submitBtn.classList.add("is-loading");
      if (statusEl) statusEl.textContent = "Enviando seus dados...";

      submitLead(form).then(function () {
        if (statusEl) statusEl.textContent = "Tudo certo! Te levando para o grupo...";
        redirect();
      });
    });
  }

  return { init: init, maskWhatsapp: maskWhatsapp };
})();
