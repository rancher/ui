import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  stacks: Ember.inject.controller(),
  projects: Ember.inject.service(),
  sortableContent: Ember.computed.alias('filteredStacks'),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  which: Ember.computed.alias('stacks.which'),
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

    if ( which === C.EXTERNAL_ID.KIND_ALL )
    {
      return all;
    }
    else if ( which === C.EXTERNAL_ID.KIND_NOT_KUBERNETES )
    {
      return all.filter((obj) => {
        return obj.get('grouping') !== C.EXTERNAL_ID.KIND_KUBERNETES;
      });
    }
    else if ( which === C.EXTERNAL_ID.KIND_NOT_SWARM )
    {
      return all.filter((obj) => {
        return obj.get('grouping') !== C.EXTERNAL_ID.KIND_SWARM;
      });
    }
    else if ( which === C.EXTERNAL_ID.KIND_NOT_MESOS )
    {
      return all.filter((obj) => {
        return obj.get('grouping') !== C.EXTERNAL_ID.KIND_MESOS;
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
    return [C.EXTERNAL_ID.KIND_USER,C.EXTERNAL_ID.KIND_ALL].indexOf(this.get('which')) === -1;
  }.property('which'),

  pageHeader: function() {
    let which = this.get('which');
    if ( which === C.EXTERNAL_ID.KIND_ALL ) {
      return 'stacksPage.header.all';
    } else if ( C.EXTERNAL_ID.SHOW_AS_SYSTEM.indexOf(which) >= 0 ) {
      return 'stacksPage.header.system';
    } else {
      return 'stacksPage.header.user';
    }
  }.property('which'),
});
