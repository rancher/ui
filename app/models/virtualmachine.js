import Ember from 'ember';
import Container from 'ui/models/container';

var VirtualMachine = Container.extend({
  modalService: Ember.inject.service('modal'),
  actions: {
    console: function() {
      this.get('modalService').toggleModal('modal-console', this);
    },

    clone: function() {
      this.get('router').transitionTo('virtualmachines.new', {queryParams: {virtualMachineId: this.get('id')}});
    },

    popoutShellVm: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console-vm?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=845,height=585,left=200,top=200");
      });
    },

    popoutLogs: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/vm-log?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=700,height=715,left=200,top=200");
      });
    },
  },
});

VirtualMachine.reopenClass({
  mangleIn: function(data) {
    // VM's baseType is container, but store doesn't handle
    // virtualMachine -> container -> instance
    data.baseType = 'instance';
    return data;
  },
});

export default VirtualMachine;
