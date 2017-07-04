import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  session:  Ember.inject.service(),

  model: null,
  showStats: false,
  bulkActions: true,
  expandPlaceholder: false,
  scalePlaceholder: false,
  cpuMax: null,
  memoryMax: null,
  storageMax: null,
  networkMax: null,
  showActions: true,
  tagName: '',

  statsAvailable: function() {
    return C.ACTIVEISH_STATES.indexOf(this.get('model.state')) >= 0 && this.get('model.healthState') !== 'started-once';
  }.property('model.{state,healthState}'),

  detailRoute: function() {
    if ( this.get('model.isVm') ) {
      return 'virtualmachine';
    } else {
      return 'container';
    }
  }.property('model.isVm'),
});
