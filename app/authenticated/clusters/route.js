import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  scope: service(),

  activate() {
    this._super();
    this.get('scope').setPageScope('clusters');
  },

  model() {
    const scope = this.get('scope');

    return hash({
      projects: scope.getAll({all: true, removeMissing: true}),
      clusters: scope.getAllClusters({removeMissing: true}),
    });
  },
});
