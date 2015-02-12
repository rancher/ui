
export function arrayDiff(a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) < 0;
  });
}

export function arrayIntersect(a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) >= 0;
  });
}

export function download(url) {
  var id = '__downloadIframe';
  var iframe = document.getElementById(id);
  if ( !iframe )
  {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = id;
    document.body.appendChild(iframe);
  }

  iframe.src = url;
}

export function popupWindowOptions(width,height) {
  var s = window.screen;
  var opt = {
    width: Math.min(s.width, width||1040),
    height: Math.min(s.height, height||768),
    resizable: 1,
    scrollbars: 1,
  };

  opt.left = Math.max(0, (s.width-opt.width)/2);
  opt.top = Math.max(0, (s.height-opt.height)/2);

  var optStr = Object.keys(opt).map(function(k) {
    return k+'='+opt[k];
  }).join(',');

  return optStr;
}

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
export function escapeHtml(html) {
  return String(html).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

var Util = {
  arrayDiff: arrayDiff,
  arrayIntersect: arrayIntersect,
  download: download,
  popupWindowOptions: popupWindowOptions,
  escapeHtml: escapeHtml
};

window.Util = Util;
export default Util;
