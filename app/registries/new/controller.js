import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  error: null,
  credentials: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.registry'),

  drivers: function() {
    return [
      {route: 'dockerhub', label: 'DockerHub',  css: 'dockerhub', available: true  },
      {route: 'quay',      label: 'Quay.io',  css: 'quay', available: true  },
      {route: 'custom',    label: 'Custom',  css: 'custom', available: true  },
    ];
  }.property(),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    errors.pushObjects(this.get('model.credential').validationErrors());

    if ( errors.get('length') > 0 )
    {
      this.set('errors', errors.uniq());
      return false;
    }

    return true;
  },

  didSave: function() {
    var registry = this.get('model.registry');
    var cred = this.get('model.credential');
    var id = registry.get('id');

    cred.set('registryId', id);
    return cred.save();
  },

  doneSaving: function() {
    this.transitionToRoute('registries');
  },
});
