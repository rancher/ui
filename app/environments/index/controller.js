import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  environments: Ember.inject.controller(),
  projects: Ember.inject.service(),
  sortableContent: Ember.computed.alias('filteredStacks'),
  prefs: Ember.inject.service(),

  which: Ember.computed.alias('environments.which'),
  showAddtlInfo: false,
  selectedService: null,

  actions: {
    showAddtlInfo(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },

    dismiss() {
      this.set('showAddtlInfo', false);
      this.set('selectedService', null);
    },

    sortResults(name) {
      this.get('prefs').set(C.PREFS.SORT_STACKS_BY, name);
      this.send('setSort', name);
    },
  },

  setup: function() {
    // Need this to setup the observer for filteredStacks
    this.get('which');

    var sort = this.get(`prefs.${C.PREFS.SORT_STACKS_BY}`);
    if (sort && sort !== this.get('sortBy')) {
      this.set('sortBy', sort);
    }
  }.on('init'),

  filteredStacks: function() {
    var which = this.get('which');
    var all = this.get('model');

    if ( which === C.EXTERNALID.KIND_ALL )
    {
      return all;
    }
    else if ( which === C.EXTERNALID.KIND_NOT_KUBERNETES )
    {
      return all.filter((obj) => {
        return obj.get('grouping') !== C.EXTERNALID.KIND_KUBERNETES;
      });
    }
    else if ( which === C.EXTERNALID.KIND_NOT_SWARM )
    {
      return all.filter((obj) => {
        return obj.get('grouping') !== C.EXTERNALID.KIND_SWARM;
      });
    }
    else
    {
      return all.filterBy('grouping', which);
    }
  }.property('model.[]','model.@each.grouping','which'),

  sortBy: 'state',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

  addSystem: function() {
    return [C.EXTERNALID.KIND_USER,C.EXTERNALID.KIND_ALL].indexOf(this.get('which')) === -1;
  }.property('which'),

  showWhich: function() {
    return [C.EXTERNALID.KIND_NOT_KUBERNETES,C.EXTERNALID.KIND_NOT_SWARM,C.EXTERNALID.KIND_USER].indexOf(this.get('which')) === -1;
  }.property('which'),

});
