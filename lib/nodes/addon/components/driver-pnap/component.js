import { alias } from '@ember/object/computed';
import { get, set, computed, notifyPropertyChange } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';


const DRIVER = 'pnap';
const CONFIG = 'pnapConfig';

export default Component.extend(NodeDriver, {
  intl: service(),
  pnap: service(),

  layout,
  driverName: DRIVER,

  model:              null,
  allProducts:        [],
  config:             alias(`model.${ CONFIG }`),

  actions: {
    finishAndSelectCloudCredential(credential) {
      set(this, 'model.cloudCredentialId', get(credential, 'id'))
    }
  },

  type: computed('allProducts', 'config.{serverLocation,serverType}', function() {
    let products = this.allProducts;

    if (Array.isArray(products)) {
      let serverLocation = this.config.serverLocation;
      let serverType = this.config.serverType;

      for (const prod of products) {
        for (const plan of prod.plans) {
          if (prod.productCode === serverType && plan.location === serverLocation) {
            return prod;
          }
        }
      }
    }

    return products.message;
  }),

  locationChoices: computed('allProducts', function() {
    let products = this.allProducts;
    let result = [];

    if (Array.isArray(products)) {
      let map = new Map();

      for (const prod of products) {
        for (const plan of prod.plans) {
          if (!map.has(plan.location)) {
            map.set(plan.location, true);
            result.push({ value: plan.location });
          }
        }
      }
    } else {
      result.push({ value: products.message });
    }

    return result;
  }),

  osChoices: computed(async function() {
    let osList = await this.pnap.request('rancher-node-driver/options');

    let oses = osList.operatingSystems;

    let result = [];

    if (Array.isArray(oses)) {
      let map = new Map();

      for (const os of oses) {
        if (!map.has(os)) {
          map.set(os, true);
          result.push({ value: os });
        }
      }
    } else {
      result.push({ value: osList.message });
    }

    return result;
  }),

  typeChoices: computed('allProducts', 'config.{serverLocation,serverType}', function() {
    let products = this.allProducts;
    let result = [];

    if (Array.isArray(products)) {
      let map = new Map();
      let serverLocation = this.config.serverLocation;

      for (const prod of products) {
        for (const plan of prod.plans) {
          if (!map.has(prod.productCode) && plan.location === serverLocation) {
            map.set(prod.productCode, true);
            result.push({
              value: prod.productCode,
              label: `${ prod.productCode  } - $${  plan.price  }/hour`
            });
          }
        }
      }
      if (!map.has(this.config.serverType) && products.length > 0){
        set(this, 'config.serverType', result[0].value);
        notifyPropertyChange(this.config, 'serverType');
      }
    } else {
      result.push({ value: products.message });
    }

    return result;
  }),

  populateProducts() {
    this.pnap.request('billing/v1/products?productCategory=SERVER').then((resp) => {
      set(this, 'allProducts', resp);
    });
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      serverLocation: 'PHX',
      serverType:     's1.c1.medium',
      serverOs:       'ubuntu/bionic',
      serverHostname: 'host'
    });

    set(this, `model.${ CONFIG }`, config);
    this.populateProducts();
  },


  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if ( !get(this, 'model.name') ) {
      errors.push(this.intl.t('nodeDriver.nameError'));
    }

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }


    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

});
