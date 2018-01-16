import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { get, set, computed } from '@ember/object';
import { reject, all as PromiseAll } from 'rsvp';

export default Controller.extend(NewOrEdit, {
  clusterStore:    service(),
  globalStore: service(),
  driver: 'googlegke',

  primaryResource: alias('model.cluster'),

  actions: {
    switchDriver(name) {
      set(this, 'errors', []);
      set(this, 'driver', name);
    },

    cancel() {
      this.send('goToPrevious', 'global-admin.clusters');
    },
  },

  sortedDrivers: computed(function() {
    return [
      {
        name: 'googlegke',
        displayName: 'Google GKE'
      },
      {
        name: 'amazoneks',
        displayName: 'Amazon EKS'
      },
      {
        name: 'azureaks',
        displayName: 'Azure AKS'
      },
    ];
  }),

  // doneSaving() {
  //   this.transitionToRoute('clusters.index');
  // },
  doneSaving() {
    return get(this, 'primaryResource').waitForState('active').then(() => {
      return this.setMembers(get(this, 'primaryResource'));
    });
  },

  setMembers(cluster) {
    const clusterId = get(cluster, 'id');
    const members = get(cluster, 'clusterRoleTemplateBindings');
    const promises = [];
    let bindings = get(this, 'model.clusterRoleTemplateBinding');
    const currentBindings = bindings.filter(b => b.clusterId === clusterId);

    members.forEach(( member ) => {
      const found = currentBindings.any(( m ) => {
        return m.subjectName === member.subjectName &&
          m.clusterId === member.clusterId &&
          m.subjectKind === member.subjectKind;
      });
      if (!found) {
        member.clusterId = clusterId;
        const promise = get(this, 'globalStore').rawRequest({
          url: 'clusterroletemplatebinding',
          method: 'POST',
          data: member,
        });
        promises.push(promise);
      }
    });

    return PromiseAll(promises).then((/* resp */) => {
      this.transitionToRoute('clusters.index');
    }).catch((error) => {
      return reject(error.body.message);
    });
  },
});
