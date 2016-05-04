import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit,{
  isEncrypted: function() {
    var key = this.get('model.key')||'';
    return key.match(/^Proc-Type: 4,ENCRYPTED$/m) || key.match(/^-----BEGIN ENCRYPTED PRIVATE KEY-----$/m);
  }.property('model.key'),

  actions: {
    cancel() {
      this.transitionToRoute('certificates');
    },
  },

  validate() {
    this._super();
    var errors = this.get('errors', errors)||[];

    if ( this.get('isEncrypted') )
    {
      errors.push('The private key cannot be password-protected.');
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },

  doneSaving() {
    this.transitionToRoute('certificates');
  }
});
