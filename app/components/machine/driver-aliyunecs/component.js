import Ember from 'ember';
import Driver from 'ui/mixins/driver';

let isOptimized=[
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
  isOptimized:     isOptimized,


  bootstrap: function() {
    let config = this.get('store').createRecord({
      type: 'aliyunecsConfig',
    });

    this.set('model', this.get('store').createRecord({
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
