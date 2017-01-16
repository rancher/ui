import Ember from 'ember';
import PolledModel from 'ui/mixins/polled-model';

export default Ember.Route.extend(PolledModel, {
  model() {
    let us = this.get('userStore');
    return Ember.RSVP.hash({
      pools: us.find('processpool', null, {forceReload: true}),
    });
  },
});
