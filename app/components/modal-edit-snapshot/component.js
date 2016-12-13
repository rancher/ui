import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  editing       : false,
  clone         : null,
  errors        : null,
  model         : null,
  snapshotName  : null,

  actions: {
    saveSnapshot: function() {
      let opts = {
        name: this.get('snapshotName')
      };
      this.get('model').doAction('snapshot', opts).then(() => {
        this.send('cancel');
      });

    }
  },

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('snapshotName', `${this.get('originalModel.name')}-${Math.round(new Date().getTime()/1000.0)}`);
  },

  didRender() {
    setTimeout(() => {
      this.$('INPUT')[0].focus();
    }, 500);
  },

});
