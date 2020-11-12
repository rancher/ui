import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

const CLUSTER_ADMIN = 'kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USER_ACCOUNT]';

export default Component.extend({
  settings: service(),

  layout,

  clusterAdmin: CLUSTER_ADMIN,
  token:        null,
});
