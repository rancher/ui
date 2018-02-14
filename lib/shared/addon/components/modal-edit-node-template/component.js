import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { loadScript, loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import { alias, empty, notEmpty } from '@ember/object/computed';
import { all } from 'rsvp';

export default Component.extend(ModalBase, {
  layout,
  growl: service(),
  modalService: service('modal'),
  globalStore: service(),

  originalModel: alias('modalService.modalOpts'),
  model: null,
  driver: null,

  loading: true,
  allNodeDrivers: null,

  actions: {
    switchDriver(name) {
      set(this, 'driver', name);
    },
  },

  availableDrivers: computed('allNodeDrivers.@each.state', function() {
    return get(this, 'allNodeDrivers').filterBy('state','active').sortBy('name');
  }),

  didReceiveAttrs() {
    set(this, 'model', get(this,'originalModel').clone());

    const desired = get(this, 'driver');

    return get(this, 'globalStore').findAll('nodeDriver').then((allNodeDrivers) => {
      set(this, 'allNodeDrivers', allNodeDrivers);

      const active = get(this, 'availableDrivers');

      if ( !desired || !active.findBy('name', desired) ) {
        set(this, 'driver', get(active, 'firstObject.name'));
      }

      return this.loadCustomUi().then(() => {
        set(this, 'loading', false);
      });
    }).catch((err) => {
      get(this, 'growl').fromError(err);
      this.sendAction('close');
    });
  },

  // Loads the custom UI CSS/JS for drivers that have a uiUrl,
  loadCustomUi() {
    const promises = [];

    get(this, 'availableDrivers').forEach((driver) => {
      const name = get(driver, 'name');
      const uiUrl = get(driver, 'uiUrl');
      if ( uiUrl ) {
        const jsUrl  = proxifyUrl(driver.uiUrl, this.get('app.proxyEndpoint'));
        const cssUrl = proxifyUrl(driver.uiUrl.replace(/\.js$/,'.css'), this.get('app.proxyEndpoint'));
        promises.push(loadScript(jsUrl, `driver-ui-js-${name}`));
        promises.push(loadStylesheet(cssUrl, `driver-ui-css-${name}`));
      }
    });

    return all(promises);
  },

  driverObj: computed('driver', function() {
    return get(this, 'model.availableDrivers').filterBy('name', get(this, 'driver'))[0];
  }),

  showPicker: empty('model.id'),
  editing: notEmpty('model.id'),
});
