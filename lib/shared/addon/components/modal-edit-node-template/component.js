import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import {
  get, set, computed, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import {
  loadScript, loadStylesheet, proxifyUrl
} from 'shared/utils/load-script';
import { empty } from '@ember/object/computed';
import { all } from 'rsvp';

export default Component.extend(ModalBase, {
  growl:        service(),
  modalService: service('modal'),
  globalStore:  service(),

  layout,
  model:  null,
  driver: null,
  onAdd:  null,

  loading:        true,
  editing:        false,
  allNodeDrivers: null,

  needReloadSchema: false,
  reloadingSchema:  false,
  schemaReloaded:   false,

  showPicker: empty('model.id'),

  availableDrivers: computed('allNodeDrivers.@each.state', 'schemaReloaded', function() {
    const out = [];
    const drivers = get(this, 'allNodeDrivers').filterBy('state', 'active').sortBy('name');

    drivers.forEach((driver) => {
      const configName = `${ get(driver, 'name') }Config`;
      const driverSchema = get(this, 'globalStore').getById('schema', configName.toLowerCase());

      if ( driverSchema ) {
        out.push(driver);
      } else {
        set(this, 'needReloadSchema', true);
      }
    });

    return out;
  }),

  availableDriversGroups: computed('availableDrivers.@each.state', function() {
    const choices = get(this, 'availableDrivers');
    const group = [];
    let groupIndex = 0;

    choices.forEach((item, index) => {
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
  reloadSchema: observer('needReloadSchema', function() {
    if ( !get(this, 'reloadingSchema') && get(this, 'needReloadSchema') ) {
      set(this, 'reloadingSchema', true);
      get(this, 'globalStore').findAll('schema', {
        url:         '/v3/schemas',
        forceReload: true
      }).then(() => {
        set(this, 'schemaReloaded', true);
        set(this, 'reloadingSchema', false);
      });
    }
  }),

  didReceiveAttrs() {
    const opts = get(this, 'modalService.modalOpts') || {};
    const originalModel = get(opts, 'nodeTemplate');

    if ( originalModel ) {
      set(this, 'originalModel', originalModel);
      set(this, 'model', originalModel.clone());
      set(this, 'editing', true);
    } else {
      set(this, 'model', get(this, 'globalStore').createRecord({ type: 'nodeTemplate', }));
    }

    let driver = get(this, 'driver');
    let override = get(opts, 'driver');

    if ( override ) {
      driver = override;
      set(this, 'showPicker', false);
    }

    set(this, 'onAdd', get(opts, 'onAdd'));

    return get(this, 'globalStore').findAll('nodeDriver').then((allNodeDrivers) => {
      set(this, 'allNodeDrivers', allNodeDrivers);

      const active = get(this, 'availableDrivers');

      if ( !driver || !active.findBy('name', driver) ) {
        driver = get(active, 'firstObject.name');
      }

      set(this, 'driver', driver);

      return this.loadCustomUi().then(() => {
        set(this, 'loading', false);
      });
    }).catch((err) => {
      get(this, 'growl').fromError(err);
      this.sendAction('close');
    });
  },

  actions: {
    switchDriver(name) {
      set(this, 'driver', name);
    },

    saved() {
      const fn = get(this, 'onAdd');
      const model = get(this, 'model');

      if ( fn ) {
        fn(model);
      }
    },

    hidePicker() {
      this.set('showPicker', false);
    },
  },

  // Loads the custom UI CSS/JS for drivers that have a uiUrl,
  loadCustomUi() {
    const promises = [];

    get(this, 'availableDrivers').forEach((driver) => {
      const name = get(driver, 'name');
      const uiUrl = get(driver, 'uiUrl');

      if ( uiUrl ) {
        const jsUrl  = proxifyUrl(driver.uiUrl, this.get('app.proxyEndpoint'));
        const cssUrl = proxifyUrl(driver.uiUrl.replace(/\.js$/, '.css'), this.get('app.proxyEndpoint'));

        promises.push(loadScript(jsUrl, `driver-ui-js-${ name }`));
        promises.push(loadStylesheet(cssUrl, `driver-ui-css-${ name }`));
      }
    });

    return all(promises);
  },

});
