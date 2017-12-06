import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';

export default Controller.extend(NewOrEdit, {
  primaryResource: alias('model.namespace'),

  actions: {
    cancel() {
      this.transitionToRoute('authenticated.cluster.ns.index');
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
