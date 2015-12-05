import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeVirtualMachine(vm) {
      this.transitionToRoute('virtualmachine', vm.get('id'));
    }
  },
});
