import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  session:  Ember.inject.service(),

  model: null,
  tagName: '',

  actions: {
    toggleExpand() {
      this.sendAction('toggleExpand', this.get('model.id'));
    }
  },

  statsAvailable: function() {
    return C.ACTIVEISH_STATES.indexOf(this.get('model.state')) >= 0 && this.get('model.healthState') !== 'started-once';
  }.property('model.{state,healthState}'),
});
