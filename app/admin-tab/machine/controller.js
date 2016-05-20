import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  application: Ember.inject.controller(),
  settings:    Ember.inject.service(),
  newMachine: null,
  sortBy: 'name',
  sorts: {name: ['name']},

  actions: {
    activate: function(driver) {
      let action = null;
      if (driver.get('actionLinks.activate')) {
        action = 'activate';
      } else if (driver.get('actionLinks.reactivate')) {
        action = 'reactivate';
      }

      driver.doAction(action);
    },
    addNewDriver: function(driver) {
      let newDriver = {
        type            : 'machineDriver',
        name            : null,
        description     : null,
        checksum        : null,
        url             : null,
        activateOnCreate: true,
      };

      if (driver) {
        newDriver.name        = driver.name;
        newDriver.description = driver.description;
        newDriver.checksum    = driver.checksum;
        newDriver.url         = driver.url;
        newDriver.externalId  = driver.id;
      }

      this.set('newMachine', this.get('userStore').createRecord(newDriver));

      this.get('application').setProperties({
        editMachineDriver: true,
        originalModel: this.get('newMachine'),
      });
    },
    addCatalogDriver: function(driver) {
      let newDriver = {
        type            : 'machineDriver',
        name            : driver.name,
        description     : (driver.description || null),
        checksum        : (driver.checksum || null),
        url             : driver.url,
        externalId      : driver.id,
        activateOnCreate: false,
      };

      this.set('newMachine', this.get('userStore').createRecord(newDriver)).save();
    },
    upgradeDriver: function(driver) {
      console.log('upgrading');
    }
  },

  sortableContent: Ember.computed('model.drivers', 'model.catalogDrivers', function() {
    // possibly add some search here
    let cDrivers   = this.get('model.catalogDrivers.catalog');
    let drivers    = this.get('model.drivers.content');
    let newContent = [];

    cDrivers.forEach((cDriver) => {
      if (!drivers.isAny('externalId', cDriver.id)) { //not in drivers
        newContent.push(cDriver);
      } else {
        let match = drivers.findBy('externalId', cDriver.id);
        if (cDriver.upgradeVersionLinks) {
          match.set('upgradeAvailable', true);
          match.set('upgradeVersionLinks', cDriver.upgradeVersionLinks);
        }
      }
    });

    newContent = newContent.concat(drivers);
    return newContent;
  }),

});
