import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Resource.extend({
  router: service(),

  canClone: true,

  actions: {
    clone() {
      this.router.transitionTo('authenticated.project.registries.new', null, { queryParams: { id: this.id } } );
    }
  }
});
