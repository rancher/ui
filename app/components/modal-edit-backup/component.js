import Ember from 'ember';

export default Ember.Component.extend({
  editing       : false,
  clone         : null,
  originalModel : null,
  errors        : null,
  model         : null,
  backupName    : null,
  backupTarget  : null,


  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    },
    saveBackup: function() {
      let opts = {
        name: this.get('backupName'),
        backupTargetId: this.get('backupTarget'),
      };
      this.get('model').doAction('backup', opts).then(() => {
        this.sendAction('dismiss');
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
