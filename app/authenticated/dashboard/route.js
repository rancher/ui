import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  scope: service(),

  redirect(model) {
    const to = get(this, 'scope.dashboardBase') + model.path;

    window.location.href = to;
  }
});
