import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

const HEADERS = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['displayName'],
    searchField:    'displayName',
    translationKey: 'generic.name',

  },
];

export default Controller.extend({
  growl:        service(),
  settings:     service(),
  globalStore:  service(),
  modalService: service('modal'),
  headers:      HEADERS,

  actions: {
    addNewDriver() {
      let newDriver = this.get('globalStore').createRecord({
        type:        'nodeDriver',
        name:        null,
        description: null,
        checksum:    null,
        url:         null,
        active:      true,
      });

      this.get('modalService').toggleModal('modal-edit-driver', newDriver);
    },

    addCatalogDriver(driver) {
      this.get('globalStore').request({ url: `${ this.get('app.catalogEndpoint') }/templates/${ driver.id }` }).then((template) => {
        this.get('globalStore').request({ url: template.versionLinks[template.defaultVersion] }).then((driver) => {
          let newDriver = this.createNewDriver(driver);

          this.get('globalStore').createRecord(newDriver).save().catch((err) => {
            this.get('growl').fromError(err);
          });
        });
      });
    },

    upgradeDriver(driver, version, url) {
      this.get('globalStore').request({ url }).then((template) => {
        driver.setProperties(this.createNewDriver(template));
        driver.save().catch((err) => {
          this.get('growl').fromError(err);
        });
      });
    }
  },

  rows: computed('model.drivers.@each.{state,id,version,externalId}', function() {
    // possibly add some search here
    let drivers    = this.get('model.drivers.content');

    return drivers;
  }),
  createNewDriver(driver) {
    return {
      type:        'nodeDriver',
      description: (driver.description || null),
      checksum:    (driver.files.checksum || '').trim() || null,
      uiUrl:       (driver.files['ui-url'] || driver.files.uiUrl || '').trim() || null,
      url:         (driver.files.url || '').trim() || null,
      externalId:  C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + driver.id,
      active:      true,
    };
  },

});
