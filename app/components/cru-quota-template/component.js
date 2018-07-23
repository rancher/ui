import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Component.extend(NewOrEdit, {
  router:      service(),
  globalStore: service(),

  layout,

  isNew:   null,
  editing: null,
  model:   null,

  primaryResource: alias('model'),

  actions: {
    cancel() {
      this.goBack();
    },

    expandFn() {
    },

    updateQuota(quota) {
      if ( quota ) {
        set(this, 'primaryResource.limit', quota);
      } else {
        set(this, 'primaryResource.limit', null);
      }
    },
  },

  goBack() {
    get(this, 'router').transitionTo('authenticated.cluster.quotas.index');
  },

  doneSaving() {
    this.goBack();
  },

});
