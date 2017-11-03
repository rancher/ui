import Ember from 'ember';

export default Ember.Component.extend({

  path: null,

  tagName: 'g',

  draw: Ember.computed('path', function() {
    var out;
    var paths = this.get('path');

    out = `M ${paths.m[0]} ${paths.m[1]}`;
    paths.l.forEach((item) => {
      out += ` L ${item[0]} ${item[1]}`;
    });
    return out;
  }),
  markerPath: function() {
    /** Markers require the full path in a SPA to work correctly */
    return window.location.pathname;
  }.property(),
});
