import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');

    return store.find('virtualmachine', params.virtualmachine_id).then(function(vm) {
      var host = vm.get('primaryHost');
      if ( host.get('instances') )
      {
        return vm;
      }
      else
      {
        return host.importLink('instances').then(() => {
          return vm;
        });
      }
    }).then(function(vm) {
      return Ember.Object.create({
        vm: vm,
      });
    });
  },
});
