import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,

  didReceiveAttrs() {
    const { workloadConfig = {} } = this;
    const  strategy = get(workloadConfig, 'strategy');

    if ( !strategy ) {
      set(workloadConfig, 'strategy', 'RollingUpdate');
    }
  }
});
