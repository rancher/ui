import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  model: null,
  showCommand: 'column', // 'no', 'column', or 'inline'
  showStats: false,
  cpuMax: null,
  memoryMax: null,
  storageMax: null,
  networkMax: null,

  tagName: 'TR',

  detailRoute: function() {
    if ( this.get('isVm') ) {
      return 'virtualmachine';
    } else {
      return 'container';
    }
  }.property('model.isVm'),
});
