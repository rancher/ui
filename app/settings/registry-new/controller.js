import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  editing: false,
  primaryResource: Ember.computed.alias('model.registry'),

  activeDriver: null,
  isCustom: Ember.computed.equal('activeDriver','custom'),

  actions: {
    selectDriver: function(name) {
      var driver = this.get('drivers').filterProperty('name',name)[0];
      this.set('activeDriver', driver.name);
      this.set('model.registry.serverAddress', driver.value);
    },

    cancel: function() {
      this.transitionTo('settings.registries');
    },
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

    var cred = this.get('model.credential');
    cred.set('registryId', 'tbd');

    errors.pushObjects(cred.validationErrors());

    if ( errors.get('length') > 0 )
    {
      this.set('errors', errors.uniq());
      return false;
    }

    return true;
  },

  doSave: function() {
    var registry = this.get('model.registry');
    var existing = this.get('model.allRegistries').filterProperty('serverAddress', registry.get('serverAddress'))[0];
    if ( existing )
    {
      this.set('model.registry', existing);
      return Ember.RSVP.resolve();
    }
    else
    {
      return this._super();
    }
  },

  didSave: function() {
    var registry = this.get('model.registry');
    var cred = this.get('model.credential');

    var existing = registry.get('credentials.lastObject');
    if ( existing )
    {
      existing.merge(cred);
      return existing.save();
    }
    else
    {
      cred.set('registryId', registry.get('id'));
      return cred.save();
    }
  },

  doneSaving: function() {
    this.transitionToRoute('settings.registries');
  },
});
