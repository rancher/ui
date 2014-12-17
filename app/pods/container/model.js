import Cattle from '../../utils/cattle';

export default Cattle.TransitioningResource.extend({
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
  dataVolumesFrom: null
});
