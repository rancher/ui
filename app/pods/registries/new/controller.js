import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  error: null,
  credentials: null,
  editing: false,
  actions: {
    addCredential: function() {
      this.get('credentials').pushObject(this.get('store').createRecord({
        type: 'registryCredential',
        publicValue: '',
        secretValue: '',
        email: ''
      }));
    }
  },

  validate: function() {
    var badCredentials = (this.get('credentials')||[]).filter((cred) => {
      cred.set('email', (cred.get('email')||'').trim());
      cred.set('publicValue', (cred.get('publicValue')||'').trim());
      cred.set('secretValue', (cred.get('secretValue')||'').trim());
      return cred.get('email').length < 1;
    });

    if ( badCredentials.length === 0 )
    {
      this.set('error','');
      return true;
    }
    else
    {
      this.set('error','Email address is required on credentials');
      return false;
    }
  },

  didSave: function() {
    var registry = this.get('model');
    var id = registry.get('id');
    var promises = [];
    this.get('credentials').forEach((cred) => {
      cred.set('registryId', id);
      promises.push(cred.save());
    });

    return Ember.RSVP.all(promises);
  },

  doneSaving: function() {
    this.transitionToRoute('registries');
  },
});
