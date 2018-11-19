import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';

export default Service.extend({
  scope:        service(),

  cluster:      alias('scope.currentCluster'),

  nodePoolsCanScale: computed('cluster.capabilities.nodePoolScalingSupported', function() {
    const capabilities = get(this, 'scope.currentCluster.capabilities');

    let poolScaleSupported = false;

    if (capabilities && get(capabilities, 'nodePoolScalingSupported')) {
      poolScaleSupported = true;
    }

    return poolScaleSupported;
  }),

  allowedNodePortRanges: computed('cluster.capabilities.nodePortRange', function() {
    const clusterCapabilities = get(this, 'scope.currentCluster.capabilities');
    var ccPorts               = [];

    if (clusterCapabilities && get(clusterCapabilities, 'nodePortRange')) {
      ccPorts = get(clusterCapabilities, 'nodePortRange').split('-');

      ccPorts = [parseInt(ccPorts[0], 10), parseInt(ccPorts[1], 10)];
    }

    return ccPorts;
  }),

  ingressCapabilities: computed('cluster.capabilities.ingressControllers.[]', function() {
    const capabilities = get(this, 'cluster.capabilities') || {};
    const controllers  = capabilities.ingressControllers ? get(capabilities, 'ingressControllers') : []; // will be ingressCapabilities
    const provider     = controllers.length > 0 ? get(controllers, 'firstObject.ingressProvider') : null;

    return {
      defaultIngressProvider:         provider,
      ingressControllersCapabilities: controllers,
    };
  }),

});
