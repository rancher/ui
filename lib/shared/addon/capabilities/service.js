import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';

export default Service.extend({
  scope:        service(),

  cluster:      alias('scope.currentCluster'),
  capabilities: alias('cluster.capabilities'),

  nodePoolsCanScale: computed('capabilities.nodePoolScalingSupported', function() {
    const { capabilities } = this || {};
    let poolScaleSupported = false;

    if (get(capabilities, 'nodePoolScalingSupported')) {
      poolScaleSupported = true;
    }

    return poolScaleSupported;
  }),

  allowedNodePortRanges: computed('capabilities.nodePortRange', function() {
    const capabilities = get(this, 'capabilities') || {};
    let ccPorts        = [];

    if (get(capabilities, 'nodePortRange')) {
      let temp = get(capabilities, 'nodePortRange').split('-');

      ccPorts = [parseInt(temp[0], 10), parseInt(temp[1], 10)];
    }

    return ccPorts;
  }),

  ingressCapabilities: computed('capabilities.ingressControllers.[]', function() {
    const { capabilities } = this || {};
    const ingressCapabilities = get(capabilities, 'ingressCapabilities') || [];
    const provider = ingressCapabilities.length > 0 ? get(ingressCapabilities, 'firstObject.ingressProvider') : null;

    return {
      defaultIngressProvider:         provider,
      ingressControllersCapabilities: ingressCapabilities,
    };
  }),

  loadBalancerCapabilites: computed('capabilities.loadBalancerCapabilities.{enabled,healthCheckSupported}', function() {
    return {
      // `enabled` field is not set for imported clusters
      l4LoadBalancerEnabled: get(this, 'capabilities.loadBalancerCapabilities.enabled') !== false,
      healthCheckSupported:  get(this, 'capabilities.loadBalancerCapabilities.healthCheckSupported'),
    }
  }),

});
