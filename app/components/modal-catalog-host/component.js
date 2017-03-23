import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  hostService           : Ember.inject.service('host'),
  classNames: ['full-modal'],
  loading: true,
  model: null,
  didRender() {
    var hs = this.get('hostService');

    hs.loadAllDrivers().then((drivers) => {
      this.set('machineDrivers', drivers);
      hs.getModel().then((hash) => {
        if (hash.transition) {
          debugger;
          // we shouldnt get here
        } else {
          this.set('loading', false);
          this.set('model', hash);
        }
      });
    });
  }
});
