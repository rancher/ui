import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  error: null,
  credentials: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.registry'),
  activeDriver: null,

  isCustom: Ember.computed.equal('activeDriver','custom'),

  actions: {
    selectDriver: function(name) {
      var driver = this.get('drivers').filterProperty('name',name)[0];
      this.set('activeDriver', driver.name);
      this.set('registry.serverAddress', driver.value);
    }
  },

  drivers: function() {
    var drivers = [
      {name: 'dockerhub', label: 'DockerHub',  css: 'dockerhub', value: 'index.docker.io', available: true  },
      {name: 'quay',      label: 'Quay.io',    css: 'quay',      value: 'quay.io',         available: true  },
      {name: 'custom',    label: 'Custom',     css: 'custom',    value: '',                available: true  },
    ];

    var active = this.get('activeDriver');
    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return drivers;
  }.property('activeDriver'),

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
