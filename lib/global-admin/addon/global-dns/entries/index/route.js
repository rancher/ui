import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  beforeModel() {
    return hash({
      allProjects: this.scope.getAllProjects(),
      allMCApps:   this.globalStore.findAll('multiclusterapp')
    });
  },

  model() {
    return this.globalStore.findAll('globaldns');
  }
});
