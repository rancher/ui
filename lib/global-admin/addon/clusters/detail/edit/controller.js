import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { get, computed, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import { all as PromiseAll } from 'rsvp';

const M_CONFIG = {
  type: 'clusterRoleTemplateBinding',
  subjectKind: '',
  subjectName: '',
  roleTemplateId: '',
  clusterId: '',
};

export default Controller.extend(NewOrEdit, {
  memberConfig: M_CONFIG,
  primaryResource: alias('model.cluster'),

  toAdd: null,
  toUpdate: null,
  toRemove: null,

  memberArray: null,

  actions: {
    updateLists(toAdd, toUpdate, toRemove) {
      setProperties(this, {
        toAdd, toUpdate, toRemove
      });
    },

    cancel() {
      this.goBack();
    },
  },

  goBack() {
    this.send('goToPrevious', 'global-admin.clusters');
  },

  displayName: computed('primaryResource.name', 'primaryResource.clusterName', function () {
    return get(this, 'primaryResource.name') || get(this, 'primaryResource.clusterName');
  }),

  didSave() {
    const pr = get(this, 'primaryResource');
    const clusterId = get(pr, 'id');

    const add = (get(this, 'toAdd') || []);
    const update = get(this, 'toUpdate') || [];
    const remove = get(this, 'toRemove') || [];

    add.forEach((x) => {
      x.set('clusterId', clusterId);
    });

    return PromiseAll(add.map(x => x.save())).then(() => {
      return PromiseAll(update.map(x => x.save())).then(() => {
        return PromiseAll(remove.map(x => x.delete())).then(() => {
          return pr;
        });
      });
    });
  },

  doneSaving() {
    this.goBack();
  }
});
