import Cattle from 'ui/utils/cattle';

var Container = Cattle.TransitioningResource.extend({
  // Common to all instances
  requestedHostId: null,
  networkIds: null,
  primaryIpAddress: null,
  primaryAssociatedIpAddress: null,

  // Container-specific
  type: 'container',
  imageUuid: null,
  command: null,
  commandArgs: null,
  environment: null,
  ports: null,
  instanceLinks: null,
  dataVolumes: null,
  dataVolumesFrom: null,
  devices: null,
  restartPolicy: null,
});

Container.reopenClass({
  alwaysInclude: ['hosts'],
});

export default Container;
