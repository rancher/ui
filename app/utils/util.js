
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

var Util = {
  arrayDiff: arrayDiff,
  arrayIntersect: arrayIntersect,
  download: download
};

window.Util = Util;
export default Util;
