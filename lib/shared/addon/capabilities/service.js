import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';

export default Service.extend({
  scope:        service(),

  cluster:      alias('scope.currentCluster'),
  capabilities: alias('cluster.capabilities'),

  nodePoolsCanScale: computed('cluster.capabilities.nodePoolScalingSupported', function() {
    const { capabilities } = this || {};
    let poolScaleSupported = false;

    if (get(capabilities, 'nodePoolScalingSupported')) {
      poolScaleSupported = true;
    }

    return poolScaleSupported;
  }),

  allowedNodePortRanges: computed('cluster.capabilities.nodePortRange', function() {
    const { capabilities } = this || {};
    let ccPorts            = [];

    if (get(capabilities, 'nodePortRange')) {
      let temp = get(capabilities, 'nodePortRange').split('-');

      ccPorts = [parseInt(temp[0], 10), parseInt(temp[1], 10)];
    }

    return ccPorts;
  }),

  ingressCapabilities: computed('cluster.capabilities.ingressControllers.[]', function() {
    const { capabilities }        = this || {};
    const { ingressCapabilities } = capabilities || [];
    const provider                = ingressCapabilities.length > 0 ? get(ingressCapabilities, 'firstObject.ingressProvider') : null;

    return {
      defaultIngressProvider:         provider,
      ingressControllersCapabilities: ingressCapabilities,
    };
  }),

});
