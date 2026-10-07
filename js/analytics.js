window.LP_ANALYTICS = (function () {
  var cfg = window.LP_CONFIG || {};
  var ready = { pixel: false, ga4: false };

  function loadPixel(id) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", id);
    window.fbq("track", "PageView");
    ready.pixel = true;
  }

  function loadGa4(id) {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
    ready.ga4 = true;
  }

  function trackLead(payload) {
    if (ready.pixel && window.fbq) window.fbq("track", "Lead");
    if (ready.ga4 && window.gtag) {
      window.gtag("event", "generate_lead", {
        utm_source: payload.utm_source,
        utm_campaign: payload.utm_campaign,
      });
    }
  }

  function init() {
    if (cfg.META_PIXEL_ID) loadPixel(cfg.META_PIXEL_ID);
    if (cfg.GA4_ID) loadGa4(cfg.GA4_ID);
  }

  return { init: init, trackLead: trackLead };
})();
