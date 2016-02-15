import Service from 'ui/models/service';

var KubernetesReplicationController = Service.extend({
  type: 'kubernetesReplicationController',
  healthState: 'healthy',
});

KubernetesReplicationController.reopenClass({
  alwaysInclude: ['instances'],
});


export default KubernetesReplicationController;
