import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  driverChoices: null,
  disk:          null,

  gigs:          null,
  tagName:       'tr',

  actions: {
    remove() {
      this.sendAction('remove');
    },

    setSize(gigs) {
      this.set('gigs', gigs);
    }
  },

  init() {
    this._super(...arguments);
    if ( this.get('disk.size') ) {
      this.set('gigs', parseInt(this.get('disk.size',10)));
    } else {
      this.set('gigs', 10);
    }
  },

  gigsChanged: function() {
    this.set('disk.size', this.get('gigs')+'g');
  }.observes('gigs'),
});
