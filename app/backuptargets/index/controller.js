import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent   : Ember.computed.alias('model.all'),
  sortBy: 'name',
  sorts: {
    state        : ['stateSort','name','id'],
    name         : ['name','id'],
    server       : ['nfsConfig.server','name','id'],
    label        : ['nfsConfig.label','name','id'],
    mountOptions : ['nfsConfig.mountOptions','name','id'],
  },

});
