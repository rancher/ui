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
        registryId: 'tbd', // This will be overwritten by didSave
        publicValue: '',
        secretValue: '',
        email: ''
      }));
    },

    removeCredential: function(obj) {
      this.get('credentials').removeObject(obj);
    }
  },

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    this.get('credentials').forEach((cred) => {
      errors.pushObjects(cred.validationErrors());
    });

    if ( errors.get('length') > 0 )
    {
      this.set('errors', errors.uniq());
      return false;
    }

    return true;
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
