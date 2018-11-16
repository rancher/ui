
let canvas;

export default function getWidth(str, fontStyle) {
  if ( !canvas ) {
    canvas = document.createElement('canvas');
  }

  const ctx = canvas.getContext('2d');

  ctx.font = fontStyle;

  return Math.ceil(ctx.measureText(str).width);
}
