export function initialize( /* application*/ ) {
  // http://jointjs.com/blog/get-transform-to-element-polyfill.html
  if ( !SVGElement.prototype.getTransformToElement ) {
    SVGElement.prototype.getTransformToElement = function(toElement) {
      return toElement.getScreenCTM().inverse()
        .multiply(this.getScreenCTM());
    };
  }
}

export default {
  name:       'polyfill-svg',
  initialize
};
