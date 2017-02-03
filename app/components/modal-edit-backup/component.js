import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts.originalModel'),
  backupTargets : Ember.computed.alias('modalService.modalOpts.backupTargets'),
  editing       : false,
  clone         : null,
  errors        : null,
  model         : null,
  backupName    : null,
  backupTarget  : null,


  actions: {
    saveBackup: function() {
      let opts = {
        name: this.get('backupName'),
        backupTargetId: this.get('backupTarget'),
      };
      this.get('model').doAction('backup', opts).then(() => {
        this.send('cancel');
      });

    }
  },

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('backupName', `${this.get('originalModel.name')}-${Math.round(new Date().getTime()/1000.0)}`);
  },

  didRender() {
    setTimeout(() => {
      this.$('INPUT')[0].focus();
    }, 500);
  },
});
