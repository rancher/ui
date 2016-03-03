import Ember from 'ember';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';

export default Ember.Component.extend(FasterLinksAndMenus,{
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
