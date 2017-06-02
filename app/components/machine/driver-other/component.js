import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  // Set by Driver
  driverName         : 'other',
  driver             : null,

  otherDriver        : null,
  availableDrivers   : null,
  typeDocumentations : null,
  schemas            : null,
  driverOpts         : null,

  bootstrap() {
    let model = this.get('store').createRecord({
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

  fieldNames: Ember.computed('otherDriver', 'model', function() {
    let driver = this.get('otherDriver');

    if ( driver ) {
      return Object.keys(this.get('userStore').getById('schema', driver.toLowerCase()).get('resourceFields'));
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

  driverChanged: Ember.on('init', Ember.observer('otherDriver','model', function() {
    if (this.get('otherDriver')) {
      let driver  = this.get('otherDriver').split('C')[0];
      let hostTemplate = this.get('model');
      let config = this.get('store').createRecord({
        type          : this.get('otherDriver'),
      });
      let secrets = this.getSecrets(this.get('userStore').getById('schema', this.get('otherDriver').toLowerCase()).get('resourceFields'));
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

  otherChoices: Ember.computed('availableDrivers.@each.{hasUi,name}', function() {
    let out = [];
    this.get('availableDrivers').filterBy('hasUi',false).forEach((driver) => {
      out.push({label: driver.name, value: driver.name+'Config'});
    });

    return out.sortBy('name');
  }),

  // willSave() {
  //   // Null out all the drivers that aren't the active one, because the API only accepts one.
  //   debugger;
  //   let activeDriver = this.get('otherDriver');
  //   let host      = this.get('model');
  //   this.get('otherChoices').forEach((choice) => {
  //     let cur = choice.value;
  //     if ( choice.value !== activeDriver ) {
  //       host.set(cur, null);
  //     }
  //   });

  //   return this._super();
  // },
});
