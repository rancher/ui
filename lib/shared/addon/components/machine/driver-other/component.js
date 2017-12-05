import { on } from '@ember/object/evented';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';

export default Component.extend(Driver, {
  layout,
  // Set by Driver
  driverName         : 'other',
  driver             : null,

  otherDriver        : null,
  availableDrivers   : null,
  typeDocumentations : null,
  schemas            : null,
  driverOpts         : null,

  bootstrap() {
    let model = this.get('globalStore').createRecord({
      type: 'hostTemplate',
      isOfTypeOther: true,
    });

    this.setProperties({
      otherDriver: this.get('otherChoices.firstObject.value'),
      model: model
    });
  },
  validate() {
    let errors = [];

    if ( !this.get('model.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

  willDestroyElement() {
    this.setProperties({
      otherDriver: null,
      driverOpts : null,
    });
  },

  fieldNames: computed('otherDriver', 'model', function() {
    let driver = this.get('otherDriver');

    if ( driver ) {
      return Object.keys(this.get('globalStore').getById('schema', driver.toLowerCase()).get('resourceFields'));
    }
  }),

  getSecrets(fields) {
    let keys = Object.keys(fields);
    let out = [];
    keys.forEach((key) => {
      if (key.toLowerCase().indexOf('secret') > -1 || key.toLowerCase().indexOf('password') > -1){
        out.push(key);
      }
    })
    return out;
  },

  driverChanged: on('init', observer('otherDriver','model', function() {
    if (this.get('otherDriver')) {
      let driver  = this.get('otherDriver').split('C')[0];
      let hostTemplate = this.get('model');
      let config = this.get('globalStore').createRecord({
        type          : this.get('otherDriver'),
      });
      let secrets = this.getSecrets(this.get('globalStore').getById('schema', this.get('otherDriver').toLowerCase()).get('resourceFields'));
      let secretConfig = {
        [this.get('otherDriver')]: {}
      }

      if (secrets) {
        secrets.forEach((secret) => {
          secretConfig[secret] = '';
        });
      }
      hostTemplate.setProperties({
        driver: driver,
        publicValues: {
          [this.get('otherDriver')]: config
        },
        secretValues: {
          [this.get('otherDriver')]: secretConfig
        },
      });
      this.set('driverOpts', hostTemplate.get(`publicValues.${this.get('otherDriver')}`));
    }
  })),

  otherChoices: computed('availableDrivers.@each.{hasUi,name}', function() {
    let out = [];
    this.get('availableDrivers').filterBy('hasUi',false).forEach((driver) => {
      out.push({label: driver.name, value: driver.name+'Config'});
    });

    return out.sortBy('name');
  }),
});
