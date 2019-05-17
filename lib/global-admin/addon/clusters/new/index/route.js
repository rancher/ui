import Route from '@ember/routing/route';
// import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore:         service(),

  redirect(/* model , transition */) {
    this.transitionTo('clusters.new.select');
  },
});
