import Ember from 'ember';
import PolledModel from 'ui/mixins/polled-model';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      stacks: this.get('store').find('stack'),
    }).then((hash) => {
      return Ember.Object.create(hash);
    });
  },
});
