import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  fullColspan: null,
  leftColspan: 1,
  rightColspan: 1,

  tagName: '',

  mainColspan: Ember.computed('fullColspan', function() {
    return (this.get('fullColspan')||2) - this.get('leftColspan') - this.get('rightColspan');
  }),
});
