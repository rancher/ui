import Ember from 'ember';

export default Ember.Controller.extend({
  growl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  queryParams: ['stackId','serviceId','containerId','launchConfigIndex','upgrade'],
  stackId: null,
  serviceId: null,
  containerId: null,
  launchConfigIndex: null,
  upgrade: null,

  launchConfigIndexInt: function() {
    let str = this.get('launchConfigIndex');
    if ( str ) {
      return parseInt(str,10);
    }
  }.property('launchConfigIndex'),

  actions: {
    done() {
      this.send('goToPrevious','containers.index');
    },

    cancel() {
      this.send('goToPrevious','containers.index');
    },

    promptRemove(idx){ 
      let slc = this.get('model.service.secondaryLaunchConfigs').objectAt(idx);
      let resources = [{
        cb: () => { this.removeSidekick(idx) },
        displayName: slc.get('name'),
      }];

      this.get('modalService').toggleModal('confirm-delete', {resources: resources, showProtip: false});
    },
  },

  removeSidekick(idx) {
    let service = this.get('model.service').clone();
    service.set('completeLaunchConfigs', true);
    service.set('completeUpdate', true);

    let slcs = service.get('secondaryLaunchConfigs');
    slcs.removeAt(idx);
    service.save().then(() => {
      this.send('done');
    }).catch((err) => {
      this.get('growl').fromError(err);
    });
  },
});
