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

  detailBaseUrl: function() {
    if ( this.get('model.isVm') )
    {
      return `/env/${this.get('projects.current.id')}/infra/vms/`;
    }
    else
    {
      return `/env/${this.get('projects.current.id')}/infra/containers/`;
    }
  }.property('model.isVm'),
});
