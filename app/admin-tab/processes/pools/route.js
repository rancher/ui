import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import PolledModel from 'ui/mixins/polled-model';

export default Route.extend(PolledModel, {
  model() {
    let us = this.get('userStore');
    return hash({
      pools: us.find('processpool', null, {forceReload: true}),
    });
  },
});
