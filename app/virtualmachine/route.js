import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');

    return store.find('virtualmachine', params.virtualmachine_id).then(function(vm) {
      return Ember.Object.create({
        vm: vm,
      });
    });
  },
});
