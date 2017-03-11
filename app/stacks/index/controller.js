import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';

export default Ember.Controller.extend(Sortable, {
  stacksController: Ember.inject.controller('stacks'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  which: Ember.computed.alias('stacksController.which'),
  tags: Ember.computed.alias('stacksController.tags'),

  filteredStacks: function() {
    var which = this.get('which');
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model.stacks');

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

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
  }.property('model.stacks.@each.{state,grouping,system}','which','tags','prefs.showSystemResources'),

  simpleMode: function() {
    if ( this.get('which') !== C.EXTERNAL_ID.KIND_ALL ) {
      return false;
    }

    let all = this.get('model.stacks');
    if ( all.get('length') > 1 ) {
      return false;
    }

    let stack = all.objectAt(0);
    return (stack.get('name')||'').toLowerCase() === 'default';
  }.property('which','model.stacks.@each.name'),

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
      return 'stacksPage.header.containers';
    } else if ( C.EXTERNAL_ID.SHOW_AS_SYSTEM.indexOf(which) >= 0 ) {
      return 'stacksPage.header.infra';
    } else if ( which.toLowerCase() === 'user') {
      return 'stacksPage.header.user';
    } else {
      return 'stacksPage.header.custom';
    }
  }.property('which','tags'),
});
