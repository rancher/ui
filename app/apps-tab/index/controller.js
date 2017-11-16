import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';
import { computed } from '@ember/object';

export default Controller.extend({
  projectController: controller('authenticated.project'),
  prefs:             service(),
  intl:              service(),
  tags:              alias('projectController.tags'),
  sortBy:            'name',
  expandedStacks:    null,

  init() {
    this._super(...arguments);
    this.set('expandedStacks',[]);
  },

  actions: {
    toggleExpand(instId) {
      let list = this.get('expandedStacks');
      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },
  },

  filteredStacks: computed('model.stacks.@each.{type,isFromCatalog,tags,state}','tags','prefs.showSystemResources', function() {
    var needTags = tagsToArray(this.get('tags'));
    var out      = this.get('model.stacks').filter((stack) => {
      if (stack.get('isFromCatalog') && C.REMOVEDISH_STATES.indexOf(stack.get('state')) === -1) {
        return true;
      }
      return false;
    });

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    return out;
  }),
});
