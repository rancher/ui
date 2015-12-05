import Ember from 'ember';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';

export default Ember.Component.extend(FasterLinksAndMenus,{
  model: null,
  showStats: false,
  cpuMax: null,
  memoryMax: null,
  storageMax: null,
  networkMax: null,

  tagName: 'TR',

  detailBaseUrl: function() {
    if ( this.get('model.isVm') )
    {
      return '/infra/vms/';
    }
    else
    {
      return '/infra/containers/';
    }
  }.property('model.isVm'),
});
