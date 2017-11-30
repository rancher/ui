import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  clusterController: controller('authenticated.cluster'),
  cluster: alias('clusterController.model'),

  queryParams : ['backTo', 'driver', 'hostId'],
  backTo      : null,
  driver      : null,
  hostId      : null,

  actions: {
    completed() {}
  }
});
