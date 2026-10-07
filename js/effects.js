window.LP_EFFECTS = (function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  function initSpotlight() {
    if (reducedMotion) return;
    var cards = document.querySelectorAll("[data-spotlight]");
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  function initScramble() {
    var mask = document.querySelector("[data-scramble]");
    if (!mask) return;
    var chars = "0123456789";

    function randomize() {
      mask.textContent = Array.from({ length: 4 }, function () {
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
    }

    if (reducedMotion) return;

    mask.classList.add("is-scrambling");
    window.setInterval(randomize, 90);
  }

  function initScrollLinks() {
    var links = document.querySelectorAll("[data-scroll-to-form]");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = link.getAttribute("href");
        if (!targetId || targetId.charAt(0) !== "#") return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        var input = target.querySelector("input");
        if (input) window.setTimeout(function () { input.focus({ preventScroll: true }); }, 400);
      });
    });
  }

  function initStickyCta() {
    var sticky = document.querySelector("[data-sticky-cta]");
    var form = document.getElementById("formulario");
    if (!sticky || !form || typeof IntersectionObserver === "undefined") return;

    var observer = new IntersectionObserver(
      function (entries) {
        var formVisible = entries[0].isIntersecting;
        sticky.classList.toggle("is-visible", !formVisible);
        sticky.toggleAttribute("inert", formVisible);
      },
      { threshold: 0 }
    );

    observer.observe(form);
  }

  function init() {
    initReveal();
    initSpotlight();
    initScramble();
    initScrollLinks();
    initStickyCta();
  }

  return { init: init };
})();
