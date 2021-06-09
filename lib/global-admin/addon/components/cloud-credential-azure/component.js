import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default Component.extend({
  router: service(),

  layout,

  tag:              null,
  config:           null,
  tenantIdRequired: false,

  init() {
    this._super(...arguments);

    const currentRoute = this.router.currentRoute;

    if (currentRoute?.name === 'global-admin.clusters.new.launch' && currentRoute?.params?.provider === 'azureaksv2') {
      set(this, 'tenantIdRequired', true);
    } else {
      set(this, 'tenantIdRequired', false);
    }
  },
});
