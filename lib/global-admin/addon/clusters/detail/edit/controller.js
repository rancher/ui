import Controller from '@ember/controller';
import ACC from 'shared/mixins/alert-child-component';
import { get, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';

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
    cancel() {
      this.goBack();
    },
  },

  goBack() {
    this.send('goToPrevious', 'global-admin.clusters');
  },

  didSave() {
    const pr = get(this, 'primaryResource');
    return pr.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.alertChildDidSave().then(() => {
        return pr;
      });
    });
  },

  doneSaving() {
    this.transitionToRoute('clusters.index');
  },
});
