import Ember from 'ember';
import PolledModel from 'ui/mixins/polled-model';

export default Ember.Route.extend(PolledModel,{
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  pollInterval: 5000,

  beforeModel() {
    this._super(...arguments);
    return this.get('projects').updateOrchestrationState();
  },

  model() {
    let k8s = this.get('k8s');

    return Ember.RSVP.hash({
      workload: k8s.workload(),
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
