import Ember from 'ember';
import Driver from 'ui/mixins/host-driver';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

export default Ember.Component.extend(Driver, {
  driverName:      'aliyunecs',
  aliyunecsConfig: Ember.computed.alias('model.publicValues.aliyunecsConfig'),
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
