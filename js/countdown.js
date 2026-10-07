window.LP_COUNTDOWN = (function () {
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  function setDigits(numEl, value) {
    var str = pad(value);
    var digits = numEl.querySelectorAll(".cd-digit");
    if (digits.length !== str.length) return;
    digits.forEach(function (d, i) {
      if (d.textContent !== str[i]) d.textContent = str[i];
    });
  }

  function tick(target, nodes) {
    var diff = target - Date.now();

    if (diff <= 0) {
      nodes.forEach(function (n) {
        n.live.hidden = true;
        n.done.hidden = false;
      });
      return false;
    }

    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;

    nodes.forEach(function (n) {
      setDigits(n.d, d);
      setDigits(n.h, h);
      setDigits(n.m, m);
      setDigits(n.s, sec);
    });

    return true;
  }

  function init() {
    var cfg = window.LP_CONFIG || {};
    var target = new Date(cfg.REVEAL_DATE).getTime();
    var blocks = document.querySelectorAll("[data-countdown]");
    if (!blocks.length || !target) return;

    var nodes = Array.prototype.map.call(blocks, function (block) {
      return {
        live: block.querySelector("[data-cd-live]"),
        done: block.querySelector("[data-cd-done]"),
        d: block.querySelector('[data-cd="d"]'),
        h: block.querySelector('[data-cd="h"]'),
        m: block.querySelector('[data-cd="m"]'),
        s: block.querySelector('[data-cd="s"]'),
      };
    });

    var running = tick(target, nodes);
    if (!running) return;

    var id = window.setInterval(function () {
      if (!tick(target, nodes)) window.clearInterval(id);
    }, 1000);
  }

  return { init: init };
})();
