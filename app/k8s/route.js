import Ember from 'ember';
import PolledModel from 'ui/mixins/polled-model';

export default Ember.Route.extend(PolledModel,{
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  pollInterval: 5000,

/*
  beforeModel() {
    this._super(...arguments);
    return this.get('projects').updateOrchestrationState();
  },

  actions: {
    error(error, transition) {
      // we have a 5xx error
      if (error.status.toString().indexOf('5') === 0) {
        // @@TODO@@ - 06-30-17 - go to host add for now until I know where vince wants this to go
        this.transitionTo('hosts');
      } else {
        // Let the route above this handle the error.
        return true;
      }
    },
  },
*/

  model() {
    let k8s = this.get('k8s');
    return Ember.RSVP.hash({
//      workload: k8s.workload(),
      workload: Ember.RSVP.resolve({
        deploymentList: { listMeta: { totalItems: 5+Math.floor(Math.random()*3) }},
        replicaSetList: { listMeta: { totalItems: 10+Math.floor(Math.random()*5) }},
        replicationControllerList: { listMeta: { totalItems: 1+Math.floor(Math.random()*2) }},
        podList: { listMeta: { totalItems: 45+Math.floor(Math.random()*5) }},
        daemonSetList: { listMeta: { totalItems: 0 }},
        statefulSetList: { listMeta: { totalItems: 0}},
        jobList: { listMeta: { totalItems: 0}}
      }),
      stacks: this.get('store').find('stack'),
    }).then((hash) => {
      return Ember.Object.create({
        workload: hash.workload,
        stacks: hash.stacks,
        kubernetesStack: k8s.filterSystemStack(hash.stacks||[]),
      });
    });
  },
});
