import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    return hash({
      pod:           this.store.find('pod', params.podId),
      containerName: params.containerName
    });
  },
});
