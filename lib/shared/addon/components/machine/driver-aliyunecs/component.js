import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

export default Component.extend(Driver, {
  layout,
  driverName:      'aliyunecs',
  aliyunecsConfig: alias('model.aliyunecsConfig'),
  ioOptimized:     ioOptimized,


  bootstrap: function() {
    let config = this.get('globalStore').createRecord({
      type: 'aliyunecsConfig',
      accessKeySecret: ''
    });

    this.set('model', this.get('globalStore').createRecord({
      type:         'machineTemplate',
      driver:       'aliyunecs',
      aliyunecsConfig: config
    }));

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
