import { alias, notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  projects:  service(),
  settings:  service(),

  cluster:   alias('projects.currentCluster'),
  canCreate: notEmpty('cluster.registrationToken.hostCommand'),
  canImport: notEmpty('cluster.registrationToken.clusterCommand'),

  header:    true,
});
