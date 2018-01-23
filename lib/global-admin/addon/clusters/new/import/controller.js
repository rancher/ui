import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';

export default Controller.extend(NewOrEdit,{
  router:     service(),

  model: null,

  primaryResource: alias('model.cluster'),

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
