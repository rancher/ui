import Component from '@ember/component'
import ClusterDriver from 'global-admin/mixins/cluster-driver';

export default Component.extend(ClusterDriver, {
  configField: 'rancherKubernetesEngineConfig',
});
