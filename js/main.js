(function () {
  function start() {
    if (window.LP_ANALYTICS) window.LP_ANALYTICS.init();
    if (window.LP_COUNTDOWN) window.LP_COUNTDOWN.init();
    if (window.LP_FORM) window.LP_FORM.init();
    if (window.LP_EFFECTS) window.LP_EFFECTS.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
