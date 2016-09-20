import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  application : Ember.inject.controller(),
  growl       : Ember.inject.service(),
  settings    : Ember.inject.service(),
  sortBy      : 'name',
  upgrading   : false,
  sorts       : {name: ['name']},
  modalService: Ember.inject.service('modal'),

  actions: {
    activate: function(driver) {
      let action = null;
      if (driver.hasAction('activate')) {
        action = 'activate';
      } else if (driver.get('actionLinks.reactivate')) {
        action = 'reactivate';
      }

      driver.doAction(action);
    },

    addNewDriver: function(driver) {
      let newDriver = this.get('userStore').createRecord({
        type            : 'machineDriver',
        name            : null,
        description     : null,
        checksum        : null,
        url             : null,
        activateOnCreate: true,
      });

      if (driver) {
        newDriver.setProperties({
          name        : driver.name,
          description : driver.description,
          checksum    : driver.checksum,
          url         : driver.url,
          externalId  : driver.id,
        });
      }

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },

    addCatalogDriver: function(driver) {
      this.get('store').request({url: this.get('app.catalogEndpoint')+'/templates/'+driver.id}).then((template) =>{

        this.get('store').request({url: template.versionLinks[template.defaultVersion]}).then((driver) =>{

          let newDriver = this.createNewDriver(driver);

          this.get('userStore').createRecord(newDriver).save().then((result) => {
            this.get('model.drivers').pushObject(result);
          }).catch((err) => {
            this.get('growl').fromError(err);
          });

        });
      });
    },

    upgradeDriver: function(driver, version/*, path*/) {

      this.set('upgrading', true);

      this.get('store').request({url: driver.fullVersionInfo[version]}).then((template) => {
        driver.setProperties(this.createNewDriver(template));
        driver.save().then(() => {
          this.set('upgrading', false);
        }).catch((err) => {
          this.set('upgrading', false);
          this.get('growl').fromError(err);
        });
      });
    }
  },

  createNewDriver: function(driver) {
    return {
      type            : 'machineDriver',
      description     : (driver.description || null),
      checksum        : (driver.files.checksum||'').trim() || null,
      uiUrl           : (driver.files.uiUrl||'').trim() || null,
      url             : (driver.files.url||'').trim() || null,
      externalId      : driver.id,
      activateOnCreate: true,
    };
  },

  sortableContent: Ember.computed('model.drivers.[]', 'model.catalogDrivers.[]', function() {
    // possibly add some search here
    let cDrivers   = this.get('model.catalogDrivers.catalog');
    let drivers    = this.get('model.drivers.content');
    let newContent = [];

    cDrivers.forEach((cDriver) => {
      let driverExistsInDrivers = drivers.find((driver) =>{

        if (driver.externalId && C.REMOVEDISH_STATES.indexOf(driver.get('state')) === -1) {

          let extId = driver.externalId.split(':');
          extId     = extId.slice(0, extId.length - 1).join(':');

          driver.set('fullVersionInfo', null);

          if (cDriver.id === extId) {

            this.get('store').request({url: `${this.get('app.catalogEndpoint')}/templateversions/${cDriver.id}`}).then((fullUpdgradeInfo) => {

              driver.set('fullVersionInfo', fullUpdgradeInfo.versionLinks);
              driver.set('currentVersion', getCurrentVersion(fullUpdgradeInfo.versionLinks, driver.externalId));

              this.get('store').request({url: this.get('app.catalogEndpoint')+'/templateversions/'+ driver.externalId}).then((upgradeInfo) => {

                if (upgradeInfo.upgradeVersionLinks && Object.keys(upgradeInfo.upgradeVersionLinks).length) {
                  driver.set('upgradeAvailable', true);
                }

              });

            });
            return true;
          }
        }

        return false;
      });

      if (!driverExistsInDrivers) { //not in drivers
        newContent.push(cDriver);
      }
    });

    var getCurrentVersion = function(driverList, externalId) {
      for (var key in driverList) {
        if (driverList[key].indexOf(externalId) > -1) {
          return key;
        }
      }
    };

    newContent = newContent.concat(drivers);

    return newContent;
  }),

});
