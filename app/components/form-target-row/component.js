import Ember from 'ember';

export default Ember.Component.extend({
  tgt: null,
  exclude: null,
  isAdvanced: null,
  isBalancer: null,

  tagName: 'TR',

  actions: {
    remove: function() {
      this.sendAction('remove', this.get('tgt'));
    },
  }
});
