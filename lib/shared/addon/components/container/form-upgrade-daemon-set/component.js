import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,

  didReceiveAttrs() {
    const config = get(this, 'workloadConfig');
    let  strategy = get(config, 'strategy');

    if ( !strategy ) {
      set(config, 'strategy', 'RollingUpdate');
    }
  }
});
