import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { loadScript, loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import { empty } from '@ember/object/computed';
import { allSettled, resolve } from 'rsvp';
import Preload from 'ui/mixins/preload';
import C from 'ui/utils/constants';

export default Component.extend(ModalBase, Preload, {
  growl:             service(),
  modalService:      service('modal'),
  globalStore:       service(),
  intl:              service(),

  layout,
  model:             null,
  driver:            null,
  onAdd:             null,

  loading:           true,
  editing:           false,
  cloning:           false,
  allNodeDrivers:    null,

  needReloadSchema:  false,
  reloadingSchema:   false,
  schemaReloaded:    false,
  customDrivers:     null,
  rejectedDriverIds: null,

  showPicker:        empty('model.id'),

  didReceiveAttrs() {
    const opts          = get(this, 'modalService.modalOpts') || {};
    const originalModel = get(opts, 'nodeTemplate');
    let { driver }      = this;
    let override        = get(opts, 'driver');
    let newModel        = null;
    let editing         = false;
    let cloning         = false;

    if (get(opts, 'edit')) {
      newModel = originalModel.clone();
      editing  = true;
    } else if (get(opts, 'clone')) {
      newModel = originalModel.cloneForNew();
      editing  = true;
      cloning  = true;
    }


    if ( originalModel ) {
      setProperties(this, {
        model:   newModel,
        originalModel,
        editing,
        cloning,
      })
    } else {
      set(this, 'model', get(this, 'globalStore').createRecord({ type: 'nodeTemplate', }));
    }

    if ( override ) {
      driver = override;

      set(this, 'showPicker', false);
    }

    set(this, 'onAdd', get(opts, 'onAdd'));

    // need to reload the schemas to fetch any new custom node template schemas so they are available for the availableDrivers
    return this.loadSchemas('globalStore').then(() => {
      return get(this, 'globalStore').findAll('nodeDriver').then((allNodeDrivers) => {
        set(this, 'allNodeDrivers', allNodeDrivers);

        const active = get(this, 'availableDrivers');

        if ( !driver || !active.findBy('name', driver) ) {
          driver = get(active, 'firstObject.name');
        }

        set(this, 'driver', driver);

        return this.loadCustomUi().then(() => {
          set(this, 'loading', false);
        })
      });
    });
  },

  actions: {
    switchDriver(name) {
      set(this, 'driver', name);
    },

    saved() {
      const fn    = get(this, 'onAdd');
      const model = get(this, 'model');

      if ( fn ) {
        fn(model);
      }
    },

    hidePicker() {
      this.set('showPicker', false);
    },
  },

  availableDrivers: computed('allNodeDrivers.@each.state', 'rejectedDriverIds.[]', function() {
    const out     = [];
    const rejectedDriverIds = get(this, 'rejectedDriverIds') || [];
    const drivers = get(this, 'allNodeDrivers').filter((driver) => {
      if (get(driver, 'state') === 'active' && !rejectedDriverIds.includes(get(driver, 'id'))) {
        return driver;
      }
    }).sortBy('name');

    drivers.forEach((driver) => {
      const configName   = `${ get(driver, 'name') }Config`;
      const driverSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

      if ( driverSchema ) {
        out.push(driver);
      }
    });

    return out;
  }),

  availableDriversGroups: computed('availableDrivers.@each.state', function() {
    const { availableDrivers } = this;
    const group                = [];
    let groupIndex             = 0;

    availableDrivers.forEach((item, index) => {
      if (index % 5 === 0) {
        group.push([item]);
        groupIndex++;
      } else {
        group[groupIndex - 1].push(item);
      }
    });

    return group;
  }),

  driverObj: computed('driver', function() {
    return get(this, 'availableDrivers').filterBy('name', get(this, 'driver'))[0];
  }),

  uiFieldHints: computed('driverObj.annotations.[]', function() {
    const uiFieldHints = get(this, 'driverObj.annotations')[C.LABEL.UI_HINTS] || null;

    if (uiFieldHints) {
      return JSON.parse(uiFieldHints);
    } else {
      return {};
    }
  }),

  // Loads the custom UI CSS/JS for drivers that have a uiUrl,
  loadCustomUi() {
    const promises = [];

    let customDrivers = (get(this, 'customDrivers') || []);

    get(this, 'availableDrivers').forEach((driver) => {
      const name = get(driver, 'name');
      const uiUrl = get(driver, 'uiUrl');

      if ( uiUrl ) {
        if (!customDrivers.includes(name)) {
          customDrivers.pushObject(name);
        }
        const jsUrl  = proxifyUrl(driver.uiUrl, this.get('app.proxyEndpoint'));
        const cssUrl = proxifyUrl(driver.uiUrl.replace(/\.js$/, '.css'), this.get('app.proxyEndpoint'));

        promises.push(loadScript(jsUrl, `driver-ui-js-${ name }`));
        promises.push(loadStylesheet(cssUrl, `driver-ui-css-${ name }`));
      }
    });

    set(this, 'customDrivers', customDrivers);

    return allSettled(promises).then((results) => {
      let rejectedResutls = results.filterBy('state', 'rejected');

      if (rejectedResutls.length >= 1) {
        let rejectedIds = rejectedResutls.map((rej) => {
          return ( get(rej, 'reason.srcElement.id') || '').split('-').get('lastObject')
        }).compact().uniq();

        set(this, 'rejectedDriverIds', rejectedIds);

        rejectedIds.forEach((reject) => {
          this.growl.fromError(this.intl.t('nodeDriver.externalError', { driverName: reject }));
        });
      }

      resolve();
    });
  },

});
