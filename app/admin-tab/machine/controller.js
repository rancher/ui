import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Controller.extend(Sortable, {
  application : Ember.inject.controller(),
  growl       : Ember.inject.service(),
  settings    : Ember.inject.service(),
  sortBy      : 'name',
  sorts       : {name: ['name']},
  modalService: Ember.inject.service('modal'),

  actions: {
    activate(driver) {
      let action = null;
      if (driver.hasAction('activate')) {
        action = 'activate';
      } else if (driver.get('actionLinks.reactivate')) {
        action = 'reactivate';
      }

      driver.doAction(action);
    },

    addNewDriver() {
      let newDriver = this.get('userStore').createRecord({
        type            : 'machineDriver',
        name            : null,
        description     : null,
        checksum        : null,
        url             : null,
        activateOnCreate: true,
      });

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },

    addCatalogDriver(driver) {
      this.get('store').request({url: this.get('app.catalogEndpoint')+'/templates/'+driver.id}).then((template) =>{

        this.get('store').request({url: template.versionLinks[template.defaultVersion]}).then((driver) =>{

          let newDriver = this.createNewDriver(driver);

          this.get('userStore').createRecord(newDriver).save().catch((err) => {
            this.get('growl').fromError(err);
          });

        });
      });
    },

    upgradeDriver(driver, version, url) {
      this.get('store').request({url: url}).then((template) => {
        driver.setProperties(this.createNewDriver(template));
        driver.save().catch((err) => {
          this.get('growl').fromError(err);
        });
      });
    }
  },

  createNewDriver(driver) {
    return {
      type            : 'machineDriver',
      description     : (driver.description || null),
      checksum        : (driver.files.checksum||'').trim() || null,
      uiUrl           : (driver.files['ui-url']||driver.files.uiUrl||'').trim() || null,
      url             : (driver.files.url||'').trim() || null,
      externalId      : C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + driver.id,
      activateOnCreate: true,
    };
  },

  sortableContent: Ember.computed('model.drivers.@each.{state,id,version,externalId}', 'model.catalogDrivers.@each.{id,catalogId,name}', function() {
    // possibly add some search here
    let cDrivers   = this.get('model.catalogDrivers.catalog');
    let drivers    = this.get('model.drivers.content');
    let newContent = [];

    cDrivers.forEach((cDriver) => {
      let driverExistsInDrivers = drivers.find((driver) =>{

        if (driver.externalId && C.REMOVEDISH_STATES.indexOf(driver.get('state')) === -1) {
          let parsed = parseExternalId(driver.externalId);
          if (cDriver.id === parsed.templateId) {
            return true;
          }
        }

        return false;
      });

      if (!driverExistsInDrivers) { //not in drivers
        newContent.push(cDriver);
      }
    });

    newContent = newContent.concat(drivers);
    return newContent;
  }),
});
