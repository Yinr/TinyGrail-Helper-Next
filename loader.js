/**
 * Bangumi TinyGrail Helper Loader
 *
 * Usage:
 *   Add next line to bookmark and click it in bangumi page.
 *     javascript:var script=document.createElement('script');script.src='https://yinr.gitee.io/bgm-thl.js';document.head.appendChild(script);
 */

var THL_URL = 'https://yinr.gitee.io/tinygrail-helper-next/loader.js';
// var TH_URL = 'https://greasyfork.org/scripts/392022-tinygrail-helper/code/TinyGrail%20Helper.user.js';
var TH_URL = 'https://greasyfork.org/scripts/408216-tinygrail-helper-next/code/TinyGrail%20Helper%20Next.user.js'

function GM_addStyle(sty) {
  var style = document.createElement('style');
  style.innerText = sty;
  document.head.appendChild(style);
}

load_script(TH_URL, 'script-th', document, (ctx) => {
  var openEl = ctx.getElementById('openTradeButton')
  if (openEl) {
    openEl.click();
  }
});

Array.from(document.getElementsByTagName('iframe')).forEach((el) => {
  load_script(THL_URL, 'script-thl', el.contentDocument);
  el.addEventListener('load', () => {
    load_script(THL_URL, 'script-thl', el.contentDocument);
  });
});


function load_script(url, id = undefined, context = document, callback = undefined) {
  if (id !== undefined && context.getElementById(id) != undefined) {
    console.log('脚本 ' + id + ' 已加载');
    return;
  }
  console.log('准备加载：' + (id || url));
  var script = context.createElement('script');
  if (id !== undefined) {
    script.id = id;
  }
  script.onload = function() {
    console.log('脚本 ' + (id || url) + ' 加载完成');
    if (callback !== undefined) {
      callback(context);
    }
  };
  script.src = url;
  context.head.appendChild(script);
}
