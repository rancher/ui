import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  growl: service(),
  scope: service(),
  modalService: service('modal'),

  queryParams: ['stackId','serviceId','containerId','addSidekick','launchConfigIndex','upgrade'],
  stackId: null,
  serviceId: null,
  containerId: null,
  addSidekick: null,
  launchConfigIndex: null,
  upgrade: false,

  launchConfigIndexInt: function() {
    let str = this.get('launchConfigIndex');
    if ( str ) {
      return parseInt(str,10);
    }
  }.property('launchConfigIndex'),

  actions: {
    transitionOut() {
      this.transitionToRoute('containers.index', this.get('scope.current.id'));
    },

    done() {
      this.send('transitionOut');
    },

    cancel() {
      this.send('transitionOut');
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
