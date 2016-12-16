import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';

export default Ember.Controller.extend(Sortable, {
  stacksController: Ember.inject.controller('stacks'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  infraTemplates: Ember.computed.alias('stacksController.infraTemplates'),
  which: Ember.computed.alias('stacksController.which'),
  tags: Ember.computed.alias('stacksController.tags'),
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

  filteredStacks: function() {
    var which = this.get('which');
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model.stacks');

    if ( which === C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION )
    {
      out = out.filter(function(obj) {
        return C.EXTERNAL_ID.KIND_ORCHESTRATION.indexOf(obj.get('grouping')) === -1;
      });
    }
    else if ( which !== C.EXTERNAL_ID.KIND_ALL )
    {
      out = out.filterBy('grouping', which);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    out = out.filter((obj) => obj.get('type').toLowerCase() !== 'kubernetesstack');

    return out;

  // state isn't really a dependency here, but sortable won't recompute when it changes otherwise
  }.property('model.stacks.[]','model.stacks.@each.{state,grouping}','which','tags'),

  sortableContent: Ember.computed.alias('filteredStacks'),
  sortBy: 'name',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

  pageHeader: function() {
    let which = this.get('which');
    let tags = this.get('tags');

    if ( tags && tags.length ) {
      return 'stacksPage.header.tags';
    } else if ( which === C.EXTERNAL_ID.KIND_ALL ) {
      return 'stacksPage.header.all';
    } else if ( C.EXTERNAL_ID.SHOW_AS_SYSTEM.indexOf(which) >= 0 ) {
      return 'stacksPage.header.infra';
    } else if ( which.toLowerCase() === 'user') {
      return 'stacksPage.header.user';
    } else {
      return 'stacksPage.header.custom';
    }
  }.property('which','tags'),
});
