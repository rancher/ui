import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  projects:  service(),
  settings:  service(),

  cluster:   computed.alias('projects.currentCluster'),
  canCreate: computed.notEmpty('cluster.registrationToken.hostCommand'),
  canImport: computed.notEmpty('cluster.registrationToken.clusterCommand'),

  header:    true,
});
