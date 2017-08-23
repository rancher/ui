import Ember from 'ember';
import Driver from 'ui/mixins/driver';

let ioOptimized=[
  {
    value : "none",
  },
  {
    value: "optimized",
  },
];

export default Ember.Component.extend(Driver, {
  driverName       : 'aliyunecs',
  aliyunecsConfig      : Ember.computed.alias('model.aliyunecsConfig'),
  ioOptimized : ioOptimized,


  bootstrap: function() {
    let config = this.get('store').createRecord({
      type                  : 'aliyunecsConfig',
    });

    this.set('model', this.get('store').createRecord({
      type: 'host',
      aliyunecsConfig: config,
    }));

    //this.set('editing', false);
  },

});
