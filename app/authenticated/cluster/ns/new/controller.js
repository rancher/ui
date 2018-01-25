import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';

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

  nameExists: computed('primaryResource.name', 'model.namespaces.@each.name', function () {
    return get(this, 'primaryResource.name') && get(this, 'model.namespaces').findBy('name', get(this, 'primaryResource.name'));
  }),
});
