import { inject as service } from '@ember/service';
import { get, observer } from '@ember/object';
import Helper from '@ember/component/helper';

export default Helper.extend({
  access: service(),
  scope:  service(),

  scopeChanged: observer('scope.currentProject.id', 'scope.currentCluster.id', function() {
    this.recompute();
  }),

  compute(params, options) {
    return !get(this, 'access').allows(options.resource, options.permission, options.scope, get(this, 'scope'));
  }
});
