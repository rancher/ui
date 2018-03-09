import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

export default Component.extend(NodeDriver, {
  layout,
  driverName:      'aliyunecs',
  config: alias('model.aliyunecsConfig'),
  ioOptimized:     ioOptimized,


  bootstrap: function() {
    let config = this.get('globalStore').createRecord({
      type: 'aliyunecsConfig',
      accessKeySecret: ''
    });

    this.set('model.aliyunecsConfig', config);
  },
  validate() {
    let errors = [];

    if ( !this.get('model.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

});
