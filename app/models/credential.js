import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';

export default Resource.extend({
  router: service(),

  canClone: true,

  actions: {
    clone() {
      this.router.transitionTo('authenticated.project.registries.new', null, { queryParams: { id: this.id } } );
    }
  }
});
