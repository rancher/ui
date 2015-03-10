import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
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

  didSave: function() {
    var registry = this.get('model');
    var id = registry.get('id');
    var promises = [];
    this.get('credentials').forEach((cred) => {
      cred.set('storagePoolId', id); // @TODO remove once renamed in https://github.com/rancherio/rancher/issues/164
      cred.set('registryId', id);
      promises.push(cred.save());
    });

    return Ember.RSVP.all(promises);
  },

  doneSaving: function() {
    this.transitionToRoute('registries');
  },
});
