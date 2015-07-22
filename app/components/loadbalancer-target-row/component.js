import Ember from 'ember';

export default Ember.Component.extend({
  tgt: null,
  targetChoices: null,
  isAdvanced: null,

  tagName: 'TR',

  actions: {
    remove: function() {
      this.sendAction('remove', this.get('tgt'));
    },
  }
});
