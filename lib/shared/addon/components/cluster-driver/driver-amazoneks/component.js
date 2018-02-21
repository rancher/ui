import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
//import { get, set } from '@ember/object';
import layout from './template';

export default Component.extend(ClusterDriver, {
  layout,
  configField: 'amazonElasticContainerServiceConfig',

  init() {
    this._super(...arguments);
  },
});
