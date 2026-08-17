
(function() {
  if (window.__snakeModFetchHook) return;
  window.__snakeModFetchHook = true;

  var origFetch = window.fetch.bind(window);
  window.fetch = async function(url, init) {
    var response = await origFetch(url, init);
    try {
      var text = await response.text();
      var looksLikeSnake =
        text.indexOf("snake_arcade") !== -1 &&
        text.indexOf("trophy") !== -1 &&
        text.indexOf("apple") !== -1;

      if (!looksLikeSnake) {
        return new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }

      var modName = localStorage.getItem("snakeChosenMod") || "none";
      if (!modName || modName === "none") {
        return new Response(text, {
          status: response.status,
          headers: { "Content-Type": "application/javascript" }
        });
      }

      window.hasFoundSnakeCodeYet = true;
      var hide = document.getElementById("code-not-found-message");
      if (hide) hide.style.display = "none";

      var mod = window[modName];
      if (!mod) {
        console.warn("Selected mod is not loaded:", modName);
        return new Response(text, {
          status: response.status,
          headers: { "Content-Type": "application/javascript" }
        });
      }

      if (mod.runCodeBefore) {
        try { mod.runCodeBefore(); } catch (err) { console.error(err); }
      }

      var code = text;
      if (mod.alterSnakeCode) {
        code = mod.alterSnakeCode(text);
      }

      if (mod.runCodeAfter) {
        code +=
          ";\n;void (function(){try{window[" +
          JSON.stringify(modName) +
          "].runCodeAfter()}catch(e){console.error(e)}})();";
      }

      console.log("Applied mod via fetch hook:", modName);
      return new Response(code, {
        status: 200,
        headers: { "Content-Type": "application/javascript" }
      });
    } catch (err) {
      console.error("snake mod fetch hook failed", err);
      return response;
    }
  };
})();
