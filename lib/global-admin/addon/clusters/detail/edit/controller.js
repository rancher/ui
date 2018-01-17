import Controller from '@ember/controller';
import ACC from 'shared/mixins/alert-child-component';
import { get, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import { all as PromiseAll } from 'rsvp';

const M_CONFIG = {
  type: 'clusterRoleTemplateBinding',
  subjectKind: '',
  subjectName: '',
  roleTemplateId: '',
  clusterId: '',
};

export default Controller.extend(ACC, {
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
    return pr.waitForCondition(true, 'BackingNamespaceCreated').then(() => {
      return this.alertChildDidSave().then(() => {
        return pr;
      });
    });
  },

  doneSaving() {
    this.transitionToRoute('clusters.index');
  },
});
