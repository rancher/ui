import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['medium-modal'],
  model: Ember.computed.alias('modalService.modalOpts'),

  name: null,
  error: null,

  actions: {
    save(cb) {
      this.set('error', null);
      this.get('model').doAction('converttoservice', {}).then(() => {
        this.send('cancel');
        Ember.run.next(() => {
          this.get('router').transitionTo('containers.index');
        });
      }).catch((err) => {
        this.set('error', err);
      }).finally(() => {
        cb();
      });
    },
  },

  didReceiveAttrs() {
    this.set('name', this.get('model.displayName'));
  },

});
