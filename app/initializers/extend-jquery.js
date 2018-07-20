export function initialize(/* application */) {
  // Define some more easings and inject into jQuery
  jQuery.extend(jQuery.easing, {
    easeOutBack(x, t, b, c, d, s) {
      if (s === undefined) {
        s = 1.70158;
      }

      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },

    easeOutCubic(x, t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
  });
}

export default {
  name:       'extend-jquery',
  initialize
};
