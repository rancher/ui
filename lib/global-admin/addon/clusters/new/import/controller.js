import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend(NewOrEdit,{
  router:     service(),

  model: null,

  primaryResource: alias('model.cluster'),

  actions: {
    cancel() {
      this.get('router').transitionTo('global-admin.clusters.index');
    },
  },

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
