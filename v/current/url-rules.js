
  
  window.webSnake = {};

  window.webSnake.urlMap = [
  {
    "oldUrl": "https://www.google.com/xjs/_/js/k=xjs.s.en.omJKIUUxeBw.2023.O/ck=xjs.s.5xo7A19oC_E.L.B1.O/am=CAAIAAAAAAAAAAQAAAAAAAAAAAAAAgQQAQAAAAAAAAAAAAAAAAAAIAQAAgAAEAAAAAAAAAAAAAAAAAAAAAAAACAQAAgAAAAAAAAAAAAAAgAAAQAAAAAAgiAAAIAAAgKAAACgBAABAABACIAGRAAAAQAAAAAAAAAAAKDQAxAAAAUAAAAAAAAewADAIxAAAAAAAAAAAAACAAAAEIBACACQAAAAAAAAAAAAAABAAAEAAABAAAAAQAAAAIABAAAIACAAqAAAAABUAAAAAAQAAAAAEAAAAAAAAAAAgAATABEgABABAQAAABAAAOAfxnwDAIAHAAAAAABAAQIAAAAAAAAAQAQAAAAQAAAAAAAAAEAQIjgAAAAAAADBsAAAAABgBBAAQCAAAgiAAAAAAAAAAAAAAIBIABEAABAAAAAAAGAAAAAAAAAAAAAAIAgAQggEAAgACgACrggFAAABAOAAAAAIAAAAAADQCAEiAAAAAAAAABQAAAAAAAAAAAgBCAAAAAJAAAAoAAAAAAAAggAAAAAAAAAACKQAAhAAMAIJACTFWRcgAgBAAAABAwAABBAUAAAAAAAAIfEDAAAIAIAAAAAAIgAAAAAAAAAAAAAAAgABAAAAgCUAWEAAAAoAAADAAXg8wBBBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAQwBxICgJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKnrK1gCA/d=0/dg=0/br=1/ujg=1/rs=ACT90oGPQnG2DvMCLcQUJCfV2k8jLJiIBg/cb=loaded_h_0/m=syj4,aLUfP,wQlYve,sy9e7,sy5cr,sy9e6,sy9e5,sy5va,sy3bs,sy3df,sy3b8,sy3b9,sy23t,pKhWu,sy23b,sy1yd,sy18t,oQfbDd,abd,sy229,TDFkye,sy23l,sy23j,IQw9J,sy237,sy22r,sy13u,sy231,sy22v,sy236,sy22f,sy1yq,sy22e,sy22p,sy22n,sy22x,sy22w,sy234,sy232,sy22z,sy230,sy233,sy22s,sy22q,sy22t,sy1px,sy22u,sy22j,sy238,sy22d,sy22i,sy22g,sy22h,sy22c,sy1qi,sy11t,sy11u,sy11p,sy11v,sy22l,ily0Be,sy24b,sy127,Zihehd,sy249,syyn,sy1zf,mf2ifc,sy1xw,sy1xv,n7qy6d,sy1xz,sy1xy,HPGtmd,sy1y2,sy1y3,sy1y0,syzl,syts,sytf,sytc,sytb,syst,syss,syqn,sy1u2,uLYJpc?cb=121509378&xjs=s3",
    "newUrl": "snake.js"
  }
];
  
  window.webSnake.blockedUrls = [
  "https://www.google.com/xjs/_/js/k=xjs.s.en.omJKIUUxeBw.2023.O/am=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAAKAAACABAABAAAAAAAAAAAAAAAAAAAAAAAAAACAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEIAACACQAAAAAAAAAAAAAABAAAEAAABAAAAAAAAAAIABAAAIACAAiAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAgAAQAAEAABABAQAAABAAAOAfxnwDAIAGAAAAAABAAQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAgAAAAAAAAAAsAAAAAAABBAAACAAAgiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAACgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAIAAAAoAAAAAAAAgAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAABAwAAAAAAAAAAAAAAIPADAAAIAAAAAAAAAgAAAAAAAAAAAAAAAgABAAAAAAAAQAAAAAoAAADAAXg8wBBBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAQwBxIAgJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKnrK1gCA/dg=0/ichc=1/rs=ACT90oGZmAWvN4IPmqoVf8jfS3c8tVeshQ/cb=loaded_h_0?cb=121509378"
];

  window.webSnake.xjsFingerprint = function(url) {
    if (typeof url !== "string") return null;
    var moduleList = url.match(/\/m=([^\/?#]+)/);
    if (!moduleList) return null;
    var xjsParam = url.match(/[?&]xjs=([^&#]*)/);
    return "m=" + moduleList[1] + "&xjs=" + (xjsParam ? xjsParam[1] : "");
  };

  window.webSnake.rewriteUrl = function(url) {
    if (url == null) return url;
    if (typeof url !== "string") {
      if (typeof URL !== "undefined" && url instanceof URL) url = url.href;
      else if (url && typeof url.url === "string") url = url.url;
      else url = String(url);
    }
    var map = window.webSnake.urlMap || [];
    var i;
    for (i = 0; i < map.length; i++) {
      if (url === map[i].oldUrl) return map[i].newUrl;
    }
    if (url.indexOf("snake.js") !== -1 && url.indexOf("/xjs/") === -1) return url;
    if (url.indexOf("/xjs/_/js/") === -1) return url;
    var fingerprint = window.webSnake.xjsFingerprint(url);
    if (fingerprint) {
      for (i = 0; i < map.length; i++) {
        if (window.webSnake.xjsFingerprint(map[i].oldUrl) === fingerprint && map[i].newUrl) {
          return map[i].newUrl;
        }
      }
    }
    if (url.indexOf("xjs=s3") !== -1 && url.indexOf("pKhWu") !== -1) {
      for (i = 0; i < map.length; i++) {
        if (map[i].newUrl && map[i].newUrl.indexOf("snake.js") !== -1) return map[i].newUrl;
      }
      return "snake.js";
    }
    return url;
  };

  window.webSnake.looksLikeSnakeJs = function(code) {
    return typeof code === "string" &&
      code.indexOf("trophy") !== -1 &&
      code.indexOf("apple") !== -1 &&
      code.indexOf("snake_arcade") !== -1;
  };

  window.webSnake._modInfoCache = null;
  window.webSnake._modInfoUrl =
    "https://raw.githubusercontent.com/DarkSnakeGang/GoogleSnakeModLoader/main/build/mod-info.json";

  // webLatestVersion is a top-level `let` in snake-web-initial.js, so it is reachable by name
  // (never as window.webLatestVersion) and only once that script has run. Returns null before then.
  window.webSnake.getLatestVersion = function() {
    if (typeof webLatestVersion === "number") return webLatestVersion;
    if (typeof window.webLatestVersion === "number") return window.webLatestVersion;
    return null;
  };

  window.webSnake.getGameVersionFromUrl = function() {
    var href = window.location.href;
    if (href.indexOf("v/current") !== -1) {
      return window.webSnake.getLatestVersion();
    }
    var match = href.match(/v\/(\d+)/);
    return match ? parseInt(match[1], 10) : window.webSnake.getLatestVersion();
  };

  window.webSnake.readAdvancedSettings = function() {
    try {
      return JSON.parse(localStorage.getItem("snakeAdvancedSettings") || "{}") || {};
    } catch (err) {
      return {};
    }
  };

  // customUrl is not in mod-info.json; the picker stores it in Advanced Settings.
  window.webSnake.injectLocalModConfigs = function() {
    if (!window.webSnake._modInfoCache || typeof window.webSnake._modInfoCache !== "object") {
      window.webSnake._modInfoCache = { modsConfig: {} };
    }
    if (!window.webSnake._modInfoCache.modsConfig) {
      window.webSnake._modInfoCache.modsConfig = {};
    }
    var advanced = window.webSnake.readAdvancedSettings();
    window.webSnake._modInfoCache.modsConfig.customUrl = {
      displayName: "Load from url",
      customModName: advanced.customModName || "",
      url: advanced.customUrl || "",
      hasUrl: true
    };
  };

  window.webSnake.resolveModObjectName = function(modName, modConfig) {
    if (modConfig && modConfig.customModName &&
        (modName === "customUrl" || localStorage.getItem("snakeForceDevMode") === "true")) {
      return modConfig.customModName;
    }
    return modName;
  };

  window.webSnake.redirectToGameVersion = function(gameVersion) {
    window.webSnake._redirecting = true;
    if (gameVersion === window.webSnake.getLatestVersion()) {
      window.location.href = "../../v/current/";
    } else {
      window.location.href = "../../v/" + gameVersion + "/";
    }
  };

  window.webSnake.getSelectedModConfig = function(modName) {
    if (!modName || modName === "none" || !window.webSnake._modInfoCache) {
      return null;
    }
    var modsConfig = window.webSnake._modInfoCache.modsConfig;
    return modsConfig && modsConfig[modName] ? modsConfig[modName] : null;
  };

  window.webSnake.ensureSelectedModLoaded = function(modName) {
    if (!modName || modName === "none" || window.webSnake._redirecting) {
      return false;
    }

    if (!window.webSnake._modInfoCache) {
      try {
        var infoReq = new XMLHttpRequest();
        infoReq.open("GET", window.webSnake._modInfoUrl, false);
        infoReq.send();
        if (infoReq.status === 200) {
          window.webSnake._modInfoCache = JSON.parse(infoReq.responseText);
        }
      } catch (err) {
        console.error(err);
      }
    }

    window.webSnake.injectLocalModConfigs();

    var modsConfig = window.webSnake._modInfoCache && window.webSnake._modInfoCache.modsConfig;
    if (!modsConfig || !modsConfig[modName]) {
      return false;
    }

    var modConfig = modsConfig[modName];
    var objectName = window.webSnake.resolveModObjectName(modName, modConfig);
    if (window[objectName]) {
      return true;
    }

    if (window.isSnakeMobileVersion && modConfig.mobile && modConfig.mobile.support === false) {
      console.warn("Mod " + modName + " does not support mobile");
      return false;
    }

    if (!modConfig.hasUrl) {
      return !!window[objectName];
    }

    var isCustomUrl = modName === "customUrl";
    var modUrl = modConfig.url;
    if (!isCustomUrl && Array.isArray(modConfig.web) && modConfig.web.length > 0) {
      var gameVersion = window.webSnake.getGameVersionFromUrl();
      var webEntry = null;
      for (var i = 0; i < modConfig.web.length; i++) {
        if (modConfig.web[i].version === gameVersion) {
          webEntry = modConfig.web[i];
          break;
        }
      }
      if (!webEntry) {
        // Only consider versions this site actually hosts, otherwise we'd redirect to a 404.
        var latestVersion = window.webSnake.getLatestVersion();
        var supportedVersions = modConfig.web
          .map(function(entry) { return entry.version; })
          .filter(function(v) { return typeof v === "number" && (latestVersion === null || v <= latestVersion); });
        if (gameVersion === null || supportedVersions.length === 0) {
          console.warn("Mod " + modName + " does not support game version " + gameVersion +
            " and no other supported version is available on this site.");
          return false;
        }
        var latestSupported = Math.max.apply(null, supportedVersions);
        console.warn(
          "Mod " + modName + " does not support game version " + gameVersion +
          ". Redirecting to version " + latestSupported + "."
        );
        window.webSnake.redirectToGameVersion(latestSupported);
        return false;
      }
      modUrl = webEntry.url;
    }

    if (!modUrl || modUrl.indexOf("PLEASE_CHOOSE") === 0) {
      console.warn("customUrl is selected but Advanced Settings has no URL");
      return false;
    }

    console.log("Preloading selected mod: " + modName +
      (objectName && objectName !== modName ? " (" + objectName + ")" : "") +
      " from " + modUrl);
    try {
      var modReq = new XMLHttpRequest();
      modReq.open("GET", modUrl, false);
      modReq.send();
      if (modReq.status !== 200) {
        console.log("Loading selected mod returned non-200 status. Received: " + modReq.status);
        return false;
      }
      (0, eval)(modReq.responseText);
    } catch (err) {
      console.error("Failed to load mod from " + modUrl, err);
      return false;
    }

    if (!window[objectName]) {
      console.warn(
        "Loaded " + modUrl + " but window." + objectName + " is missing. " +
        "Set Custom Mod Name in Advanced Settings to the global the file assigns " +
        "(PuddingMod, SpeedrunMod, moreMenu, ...)."
      );
      return false;
    }
    return true;
  };

  window.webSnake.applySelectedMod = function(code) {
    if (!window.webSnake.looksLikeSnakeJs(code) || window.webSnake._modsApplied) return code;
    var modName = localStorage.getItem("snakeChosenMod") || "none";
    if (!modName || modName === "none") return code;
    var modConfig = window.webSnake.getSelectedModConfig(modName);
    var objectName = window.webSnake.resolveModObjectName(modName, modConfig || {});
    var mod = window[objectName];
    if (!mod) {
      window.webSnake.ensureSelectedModLoaded(modName);
      modConfig = window.webSnake.getSelectedModConfig(modName);
      objectName = window.webSnake.resolveModObjectName(modName, modConfig || {});
      mod = window[objectName];
    }
    if (!mod) {
      console.warn("Selected mod is not loaded:", modName);
      return code;
    }
    window.webSnake._modsApplied = true;
    window.hasFoundSnakeCodeYet = true;
    var msg = document.getElementById("code-not-found-message");
    if (msg) msg.style.display = "none";
    if (mod.runCodeBefore) {
      try { mod.runCodeBefore(); } catch (err) { console.error(err); }
    }
    if (mod.alterSnakeCode) {
      try { code = mod.alterSnakeCode(code); } catch (err) {
        console.error(err);
        return code;
      }
    }
    if (mod.runCodeAfter) {
      code += ";\nvoid (function(){try{window[" + JSON.stringify(objectName) + "].runCodeAfter()}catch(e){console.error(e)}})();";
    }
    console.log("Applied mod to snake.js:", modName);
    return code;
  };

  // Keep natives in a closure. snake-web-initial.js assigns window.oldXhrOpen /
  // window.oldFetch, and a top-level `var oldXhrOpen` is the same binding.
  (function() {
    var nativeXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      if (arguments.length > 1) arguments[1] = window.webSnake.rewriteUrl(arguments[1]);
      return nativeXhrOpen.apply(this, arguments);
    };

    var nativeFetch = window.fetch;
    window.fetch = function(resource) {
      var original = typeof resource === "string" ? resource
        : (typeof URL !== "undefined" && resource instanceof URL) ? resource.href
        : (resource && resource.url) ? resource.url
        : resource;
      var rewritten = window.webSnake.rewriteUrl(original);
      if (rewritten !== original) arguments[0] = rewritten;
      var request = nativeFetch.apply(this, arguments);
      var target = rewritten !== original ? rewritten : original;
      if (typeof target === "string" && (target.indexOf("snake.js") !== -1 || (target.indexOf("xjs=s3") !== -1 && target.indexOf("pKhWu") !== -1))) {
        return request.then(function(response) {
          return response.text().then(function(text) {
            return new Response(window.webSnake.applySelectedMod(text), {
              status: response.status,
              statusText: response.statusText,
              headers: { "Content-Type": "application/javascript" }
            });
          });
        });
      }
      return request;
    };

    window.webSnake.isSnakeBundleUrl = function(url) {
      if (!url || typeof url !== "string" || url.indexOf("blob:") === 0) return false;
      var rewritten = window.webSnake.rewriteUrl(url);
      if (rewritten && rewritten.indexOf("snake.js") !== -1 && rewritten.indexOf("/xjs/") === -1) return true;
      return url.indexOf("xjs=s3") !== -1 && url.indexOf("pKhWu") !== -1;
    };

    var nativeAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(el) {
      if (el && el.tagName === "SCRIPT") {
        if (el.src && el.src.indexOf("blob:") !== 0) {
          var originalSrc = el.src;
          var rewritten = window.webSnake.rewriteUrl(originalSrc);
          var modName = localStorage.getItem("snakeChosenMod") || "none";
          var isSnake = window.webSnake.isSnakeBundleUrl(originalSrc) || window.webSnake.isSnakeBundleUrl(rewritten);
          if (isSnake && modName && modName !== "none") {
            try {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", rewritten.indexOf("snake.js") !== -1 ? rewritten : "snake.js", false);
              xhr.send();
              var code = window.webSnake.applySelectedMod(xhr.responseText || "");
              el.src = URL.createObjectURL(new Blob([code], { type: "application/javascript" }));
            } catch (err) {
              console.error(err);
              if (rewritten !== originalSrc) el.src = rewritten;
            }
          } else if (rewritten !== originalSrc) {
            el.src = rewritten;
          }
        } else if (!el.src) {
          var source = el.text || el.textContent || "";
          if (source) {
            var modded = window.webSnake.applySelectedMod(source);
            if (modded !== source) el.textContent = modded;
          }
        }
      }
      return nativeAppendChild.call(this, el);
    };
  })();

  (function preloadSelectedModForUrlRules() {
    // Wait for the rest of the parser-blocking scripts: snake-web-initial.js defines
    // webLatestVersion (needed to know which version /current is, and where to redirect) and
    // snake-mod-loader-web.js applies ?mod=. readyState becomes "interactive" before deferred
    // scripts run, so this still happens before snake-loader.js requests snake.js.
    function preload() {
      var modName = localStorage.getItem("snakeChosenMod") || "none";
      if (modName && modName !== "none") {
        window.webSnake.ensureSelectedModLoaded(modName);
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("readystatechange", function onReadyStateChange() {
        if (document.readyState === "loading") return;
        document.removeEventListener("readystatechange", onReadyStateChange);
        preload();
      });
    } else {
      preload();
    }
  })();

