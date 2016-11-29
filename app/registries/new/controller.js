import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  editing: false,
  primaryResource: Ember.computed.alias('model.registry'),

  activeDriver: null,
  isCustom: Ember.computed.equal('activeDriver','custom'),

  actions: {
    selectDriver: function(name) {
      var driver = this.get('drivers').filterBy('name',name)[0];
      this.set('activeDriver', driver.name);
      this.set('model.registry.serverAddress', driver.value);
    },

    cancel: function() {
      this.transitionToRoute('registries');
    },
  },

  drivers: function() {
    var drivers = [
      {name: 'dockerhub', label: 'DockerHub',  css: 'dockerhub', value: 'index.docker.io' },
      {name: 'quay',      label: 'Quay.io',    css: 'quay',      value: 'quay.io',        },
      {name: 'custom',    label: 'Custom',     css: 'custom',    value: '',               },
    ];

    var active = this.get('activeDriver');
    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return drivers;
  }.property('activeDriver'),

  cleanAddress: function() {
    let cur = this.get('model.registry.serverAddress')||'';
    let neu = cur.replace(/^http(s)?:\/\/(.*)$/,'$2');
    neu = neu.replace(/\/.*$/,'');

    if ( cur !== neu ) {
      this.set('model.registry.serverAddress', neu);
    }

  },

  validate: function() {
    this.cleanAddress();

    this._super();

    var errors = this.get('errors')||[];

    var registry = this.get('model.registry');
    var existing = this.get('model.allRegistries').filterBy('serverAddress', registry.get('serverAddress'))[0];
    if ( existing )
    {
      errors.push('There is already a registry defined for ' + existing.get('displayAddress'));
    }

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
    this.transitionToRoute('registries');
  },
});
