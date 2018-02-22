import { get, set } from '@ember/object';
import Component from '@ember/component'

export default Component.extend({

  init(...args) {
    this._super(...args);
    const value = +get(this, 'value') || 0;
    const d = moment.duration(value * 1000);

    set(this, 'h', d.hours());
    set(this, 'm', d.minutes());
    set(this, 's', d.seconds());
  },

  setValue: function() {
    const h = +get(this, 'h') || 0;
    const m = +get(this, 'm') || 0;
    const s = +get(this, 's') || 0;

    set(this, 'value', h * 3600 + m * 60 + s);
  }.observes('h', 'm', 's'),
});
