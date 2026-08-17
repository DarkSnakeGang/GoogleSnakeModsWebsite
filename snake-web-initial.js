let webLatestVersion = 13; //Update this every time a new version is added. This should correspond to the version of the snake clone in v/current.

//Code in here runs before snake-mod-loader-web.js
//Useful to help set stuff up specific to the web version, that doesn't belong in the mod-loader script

window.webSnake = window.webSnake ?? {};
window.webSnake.logUrlChanges = false;

//Disable analytics
window.navigator.sendBeacon = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('beacon disabled');
}

//Disable google logging
window.google.log = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('google.log disabled');
}

window.google.logUrl = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('google.logUrl disabled');
}

//Update url redirects to be relative
//Commented out as this might not be needed
/*
window.webSnake.urlMap.forEach(rule => {
  const thisUrl = new URL(document.location);
  const urlStart = thisUrl.origin + thisUrl.pathname;
  rule.newUrl = thisUrl.origin + thisUrl.pathname + rule.newUrl;
});
*/

/*
  Reduces an xjs url down to the parts that identify which bundle is being requested.
  Everything else (md, k, ck, am, rs, d, ed, dg, br, ujg, ichc, cb) is rebuilt by Google on every
  deploy, so a url-rules.js entry captured from an older build stops matching by exact string even
  though it still points at the same code. The module list and the xjs parameter survive those
  rebuilds, so they are what we key on.
*/
function getXjsFingerprint(url) {
  if(typeof url !== 'string') {return null;}

  //The module list is the /m=... path segment, which runs until the query string
  let moduleList = url.match(/\/m=([^\/?#]+)/);

  if(!moduleList) {return null;}

  let xjsParam = url.match(/[?&]xjs=([^&#]*)/);

  return 'm=' + moduleList[1] + '&xjs=' + (xjsParam ? xjsParam[1] : '');
}

//Returns the local file a url should be served from, or null if it should be left alone
window.webSnake.resolveUrl = function(url) {
  if(typeof url !== 'string') {return null;}

  url = makeUrlAbsolute(url);

  if(!Array.isArray(window.webSnake.urlMap)) {return null;}

  let mapping = window.webSnake.urlMap.find(m=>m.oldUrl === url);

  if(mapping && mapping.newUrl) {
    window.webSnake.logUrlChanges && console.log('Redirecting url: ' + url);
    return mapping.newUrl;
  }

  //Only the game bundle gets the looser fingerprint treatment. The page pulls down several other
  //xjs chunks and none of them should ever be swapped for a local file.
  if(!url.includes('/xjs/_/js/')) {return null;}

  let fingerprint = getXjsFingerprint(url);

  if(!fingerprint) {return null;}

  mapping = window.webSnake.urlMap.find(m=>getXjsFingerprint(m.oldUrl) === fingerprint);

  if(mapping && mapping.newUrl) {
    //Logged separately from an exact hit so it's obvious when url-rules.js has gone stale
    window.webSnake.logUrlChanges && console.log('Redirecting url (fingerprint match, url-rules.js is out of date): ' + url + ' -> ' + mapping.newUrl);
    return mapping.newUrl;
  }

  return null;
}

//Block urls in xhr
window.oldXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
  let url = makeUrlAbsolute(arguments[1]);
  
  if(window.webSnake.blockedUrls.includes(url)) {
    window.webSnake.logUrlChanges && console.log('Blocking url: ' + url);
    throw new Error('Blocking url ' + url); //Slightly sketchy to error here as it may have side effects. This seems ok in practise
  }

  //snake-loader.js fetches the game bundle over xhr, so the redirect has to happen here too
  let xhrTarget = window.webSnake.resolveUrl(arguments[1]);

  if(xhrTarget) {
    arguments[1] = xhrTarget;
  }

  return oldXhrOpen.apply(this, arguments);
};

window.oldFetch = window.fetch;

window.fetch = function(resource) {
  let isRequestObject = typeof Request !== 'undefined' && resource instanceof Request;
  let url = null;

  if(typeof resource === 'string') {
    url = resource;
  } else if(typeof URL !== 'undefined' && resource instanceof URL) {
    url = resource.href;
  } else if(isRequestObject) {
    url = resource.url;
  }

  let target = window.webSnake.resolveUrl(url);

  if(target) {
    //Rebuild the Request rather than passing the bare url so method/headers/body aren't dropped
    arguments[0] = isRequestObject ? new Request(target, resource) : target;
  }

  return window.oldFetch(...arguments);
}

/*
  snake-loader.js pulls the game bundle in by appending a <script> to the body, so neither of the
  interceptors above sees it. snake-mod-loader-web.js wraps appendChild too, but only rewrites on
  an exact url match, and it hands anything it doesn't claim back to whatever appendChild it found
  first. Patching here means we sit underneath that wrapper and still catch the bundle when
  url-rules.js has gone stale.
*/
document.body.appendChildNative = document.body.appendChild;

document.body.appendChild = function(el) {
  if(el && el.tagName === 'SCRIPT') {
    let scriptTarget = window.webSnake.resolveUrl(el.src);

    if(scriptTarget) {
      el.src = scriptTarget;
    }
  }

  return document.body.appendChildNative(el);
};

function makeUrlAbsolute(url) {
  //If url starts with / then add https://www.google.com
  if (/^\/[^\/]/.test(url)) {
    url = "https://www.google.com" + url;
  }
  return url;
}

function switchToMobile() {
  const currentGameVersion = getGameVersionFromUrl(); //defined in snake-mod-loader-web.js

  //Add is-mobile data attribute
  let snakeContainer = document.getElementsByClassName('EjCLSb')[0];
  snakeContainer.dataset.isMobile = '';

  //Delete fullscreen button
  let fullscreenButtonOld = document.querySelector('img[src$="fullscreen_white_24dp.png"]')
  if(fullscreenButtonOld) {
    fullscreenButtonOld.remove();
  }

  let fullscreenButtonsNew = document.querySelectorAll('div.EFcTud[jsaction="zeJAAd"]');
  if(fullscreenButtonsNew.length > 0) {
    [...fullscreenButtonsNew].forEach(button => button.remove());
  }

  //Add styles needed for mobile
  let css = `
  
  /*Flexible size for snake container*/
  .EjCLSb {
    height: 100% !important;
    min-height: 0 !important;
    min-width: 0 !important;
    width: 100% !important;
  }

  /*Don't centre the snake container*/
  .yZz3de {
    position: static !important;
    left: 0 !important;
    top: 0 !important;
    transform: none !important;
  }

  /*Change keys image to swipe image*/
  .rNjvu {
    background-image: url(//www.google.com/logos/fnbx/snake_arcade/swipe.svg) !important
  }

  /*Menu modal panels don't overlap edge*/
  .T7SB3d {
    width: calc(100% - 64px) !important;
    max-width: 300px !important;
  }

  /*Buttons below menu modal dont overlap edge*/
  .wUt0xf {
    width: calc(100% - 64px) !important;
    max-width: 300px !important;
  }

  /*Current/highscore on menu modal taking up less space*/
  @media only screen and (max-width: 315px),only screen and (orientation:landscape) and (max-height:315px) {
    .bF4Gmf {
        margin-left:5% !important;
        margin-right: 5% !important;
    }
  }

  /*Current/highscore on menu modal taking up less space*/
  @media only screen and (max-width: 215px),only screen and (orientation:landscape) and (max-height:215px) {
      .bF4Gmf {
          margin-left:0% !important;
          margin-right: 0% !important;
      }
  }

  /*score on top bar less wide*/
  .HIonyd {
    width: 45px !important;
  }

  /*score on top bar less wide responsively*/
  @media only screen and (max-width: 285px), only screen and (orientation: landscape) and (max-height: 285px)
  .HIonyd {
      width: 35px !important;
      padding-left: 0 !important;
  }
  `;

  if(currentGameVersion >= 5) {
    //Add in additional changes to the html/css that were introduced in version 5
    css += `
    /*hide icons on the menu buttons (play/settings/daily challenge) to save space on small screens*/
    @media only screen and (max-width: 285px) {
      .DwxlBd {
          display:none
      }
    }

    /* I'm not 100% sure what .jKj29e is for.
      I suspect it is used to hide menu buttons as above when the translations for play/settings/daily challenge are really long (>20 chars)
    */
    @media only screen and (max-width: 340px) {
        .jKj29e .DwxlBd {
            display:none
        }

        .jKj29e .qM98Ge {
            visibility: hidden
        }
    }

    /* Same as above, but .KjMIn is for translations >25 chars.
    @media only screen and (max-width: 355px) {
        .jKj29e .DwxlBd {
            display:none
        }

        .KjMIn .qM98Ge {
            visibility: hidden
        }
    }

    /* .SU4xse is set when the daily challenge menu is visible */
    @media only screen and (max-width: 340px) {
        /* Smaller image icons */
        .SU4xse .fbftZe {
            width:28px
        }

        /* Probably image icons again on daily challenge if there are at least 5 modes? */
        .SU4xse .OZ9aHc {
            border-radius: 4px;
            margin: 3px;
            padding: 3px;
            width: 20px
        }

        /* Small daily challenge icons in the "previous days" view */
        .SU4xse .Cg6pxb .fbftZe {
            border-radius: 4px;
            margin: 8px 2px;
            padding: 2px;
            width: 16px
        }
    }

    /* Various restrictions based on height */
    @media only screen and (max-height: 650px) {
        /* Shorter play/settings/daily challenge buttons */
        .FL0z2d {
            height:36px;
            margin-top: 8px
        }

        /* Shorter play/settings/daily challenge icons */
        .DwxlBd {
            height: 30px;
            width: 30px
        }

        /* Small play/settings/daily challenge font-size */
        .l3ryBd {
            font-size: 17px
        }

        /* Maybe something for svgs? No idea really */
        .w9ahb {
            height: 26px;
            width: 26px
        }

        .w9ahb svg {
            width: 100%;
            height: 100%
        }
    }

    /*  Undo some styles that exist only of the desktop version */
    /* remove aspect ratio constraint on game canvas */
    .jNB0Ic {
        aspect-ratio: auto !important;
    }

    /*main container of everything */
    :not(.DgO4x).EjCLSb {
        max-width: none !important;
    }

    /*main container of everything */
    @media only screen and (min-height: 650px) {
        :not(.DgO4x).EjCLSb {
            max-height: none !important;
        }
    }

    /* Custom css for gsm so that the button for enabling touch pad controls isn't blocked */
    .O6HIqc {
      right: unset !important;
      left: 10px;
    }
    `;

    //Add class so that game can adapt height depending on whether mobile touchpad is enabled
    let divWithMainCanvas = document.getElementsByClassName('cer0Bd')[0].parentElement;
    divWithMainCanvas.classList.add('azpHl');

    //Add stuff for the mobile touchpad (touchpad itself + the button to enable it)
    let settingsOverlay = document.getElementsByClassName('wjOYOd')[0];

    const touchpadHtml = `
    <div jsname="Ycs2rd" class="Oiw5Ib" jsaction="touchstart:G0IZGc;touchmove:G0IZGc;touchend:G0IZGc" data-ved="0ahUKEwjzppHUw_eFAxWPR_EDHQIwB6kQvNgMCAM">
        <div class="KM6Me">
            <div jsname="MUDVS" class="CyfBUb fzrkB">
                <div class="YD2pbc">
                    <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                        <path d="M480-360 280-560h400L480-360Z" fill="#000000"></path>
                    </svg>
                </div>
            </div>
            <div jsname="rmiREc" class="CyfBUb DVNA1b">
                <div class="YD2pbc">
                    <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                        <path d="M480-360 280-560h400L480-360Z" fill="#000000"></path>
                    </svg>
                </div>
            </div>
            <div jsname="p4rndc" class="CyfBUb aq6vAe">
                <div class="YD2pbc">
                    <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                        <path d="M480-360 280-560h400L480-360Z" fill="#000000"></path>
                    </svg>
                </div>
            </div>
            <div jsname="dICtMc" class="CyfBUb EyxhB">
                <div class="YD2pbc">
                    <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                        <path d="M480-360 280-560h400L480-360Z" fill="#000000"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div jsname="k8ZH5e" class="ekPAb">
            <div class="SjfyTc"></div>
        </div>
    </div>
    `;

    const enableTouchpadButton = `
    <div class="O6HIqc" aria-label="Toggle virtual controls" role="button" tabindex="0" jsaction="Uex1ad">
        <div class="qMDOx">
            <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                <path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z" fill="#FFFFFF"></path>
            </svg>
        </div>
        <div jsname="ZxgYgc" class="DZekPe vCjPXe" data-ved="0ahUKEwjzppHUw_eFAxWPR_EDHQIwB6kQxvMMCAU">
            <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                <path d="M172.309-260.001q-30.308 0-51.308-21t-21-51.435v-295.128q0-30.435 21-51.435 21-21 51.308-21h615.382q30.308 0 51.308 21t21 51.435v295.128q0 30.435-21 51.435-21 21-51.308 21H172.309Zm0-59.999h615.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-295.382q0-4.616-3.846-8.463-3.847-3.846-8.463-3.846H172.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v295.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846Zm117.692-50.001h59.998v-80h80v-59.998h-80v-80h-59.998v80h-80v59.998h80v80Zm289.954 0q20.814 0 35.429-14.57 14.615-14.57 14.615-35.384t-14.57-35.429q-14.57-14.615-35.384-14.615t-35.429 14.57q-14.615 14.57-14.615 35.384t14.57 35.429q14.57 14.615 35.384 14.615Zm120-120q20.814 0 35.429-14.57 14.615-14.57 14.615-35.384t-14.57-35.429q-14.57-14.615-35.384-14.615t-35.429 14.57q-14.615 14.57-14.615 35.384t14.57 35.429q14.57 14.615 35.384 14.615ZM160-320V-640-320Z" fill="#FFFFFF"></path>
            </svg>
        </div>
        <div jsname="fIqioc" class="ufnB2c vCjPXe" data-ved="0ahUKEwjzppHUw_eFAxWPR_EDHQIwB6kQxfMMCAY">
            <svg height="100%" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                <path d="M172.309-260.001q-30.308 0-51.308-21t-21-51.435v-295.128q0-30.435 21-51.435 21-21 51.308-21h615.382q30.308 0 51.308 21t21 51.435v295.128q0 30.435-21 51.435-21 21-51.308 21H172.309Zm0-59.999h615.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-295.382q0-4.616-3.846-8.463-3.847-3.846-8.463-3.846H172.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v295.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846Zm117.692-50.001h59.998v-80h80v-59.998h-80v-80h-59.998v80h-80v59.998h80v80Zm289.954 0q20.814 0 35.429-14.57 14.615-14.57 14.615-35.384t-14.57-35.429q-14.57-14.615-35.384-14.615t-35.429 14.57q-14.615 14.57-14.615 35.384t14.57 35.429q14.57 14.615 35.384 14.615Zm120-120q20.814 0 35.429-14.57 14.615-14.57 14.615-35.384t-14.57-35.429q-14.57-14.615-35.384-14.615t-35.429 14.57q-14.615 14.57-14.615 35.384t14.57 35.429q14.57 14.615 35.384 14.615ZM160-320V-640-320Z" fill="#FFFFFF"></path>
            </svg>
        </div>
    </div>
    `;

    settingsOverlay.insertAdjacentHTML('beforebegin', touchpadHtml);
    settingsOverlay.insertAdjacentHTML('afterbegin', enableTouchpadButton);

    //Rotate game to portrait for mobile
    const rotateGameMobileHtml = `
    <div jsname="ar2wLb" class="t6jjTb">
        <img class="xAAoNb" src="https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/screen_rotation/default/48px.svg" alt="Rotate device to portrait">
    </div>
    `;

    snakeContainer.insertAdjacentHTML('beforeend', rotateGameMobileHtml);
  }

  let styleElement = document.createElement('style');
  styleElement.innerHTML = css;
  document.head.appendChild(styleElement);
}
