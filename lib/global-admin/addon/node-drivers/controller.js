import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Controller.extend({
  application:  controller(),
  growl:        service(),
  settings:     service(),
  globalStore:  service(),
  modalService: service('modal'),

  headers: [
    {
      name: 'state',
      sort: ['sortState','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['displayName'],
      searchField: 'displayName',
      translationKey: 'generic.name',

    },
  ],

  actions: {
    addNewDriver() {
      let newDriver = this.get('globalStore').createRecord({
        type            : 'nodeDriver',
        name            : null,
        description     : null,
        checksum        : null,
        url             : null,
        active          : true,
      });

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },

    addCatalogDriver(driver) {
      this.get('globalStore').request({url: this.get('app.catalogEndpoint')+'/templates/'+driver.id}).then((template) =>{

        this.get('globalStore').request({url: template.versionLinks[template.defaultVersion]}).then((driver) =>{

          let newDriver = this.createNewDriver(driver);

          this.get('globalStore').createRecord(newDriver).save().catch((err) => {
            this.get('growl').fromError(err);
          });

        });
      });
    },

    upgradeDriver(driver, version, url) {
      this.get('globalStore').request({url: url}).then((template) => {
        driver.setProperties(this.createNewDriver(template));
        driver.save().catch((err) => {
          this.get('growl').fromError(err);
        });
      });
    }
  },

  createNewDriver(driver) {
    return {
      type            : 'nodeDriver',
      description     : (driver.description || null),
      checksum        : (driver.files.checksum||'').trim() || null,
      uiUrl           : (driver.files['ui-url']||driver.files.uiUrl||'').trim() || null,
      url             : (driver.files.url||'').trim() || null,
      externalId      : C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + driver.id,
      active          : true,
    };
  },

  rows: computed('model.drivers.@each.{state,id,version,externalId}', 'model.catalogDrivers.@each.{id,catalogId,name}', function() {
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
