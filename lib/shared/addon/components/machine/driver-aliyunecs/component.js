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
  aliyunecsConfig: alias('model.publicValues.aliyunecsConfig'),
  ioOptimized:     ioOptimized,


  bootstrap: function() {
    let config = this.get('userStore').createRecord({
      type: 'aliyunecsConfig',
    });

    this.set('model', this.get('userStore').createRecord({
      type:         'hostTemplate',
      driver:       'aliyunecs',
      publicValues: {
        aliyunecsConfig: config
      },
      secretValues: {
        aliyunecsConfig: {
          accessKeySecret: ''
        }
      }
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
