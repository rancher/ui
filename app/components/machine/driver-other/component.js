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

  init() {
    this._super(...arguments);

    this._super();
    this.driverChanged();
  },

  bootstrap() {
    let model = this.get('store').createRecord({
      type: 'host',
    });

    this.setProperties({
      otherDriver: this.get('otherChoices.firstObject.value'),
      model: model
    });
  },

  willDestroyElement() {
    this.setProperties({
      otherDriver: null,
      driverOpts : null,
    });
  },

  fieldNames: function() {
    let driver = this.get('otherDriver');

    if ( driver ) {
      return Object.keys(this.get('userStore').getById('schema', driver.toLowerCase()).get('resourceFields'));
    }
  }.property('otherDriver', 'model'),

  driverChanged: function() {
    let driver  = this.get('otherDriver');
    let host = this.get('model');

    if ( driver && host) {
      if ( !host.get(driver) ) {
        host.set(driver, this.get('store').createRecord({ type: driver }));
      }

      this.set('driverOpts', host.get(driver));
    }
    else {
      this.set('otherDriver', this.get('otherChoices.firstObject.value'));
    }
  }.observes('otherDriver','model'),

  otherChoices: function() {
    let out = [];
    this.get('availableDrivers').filterBy('hasUi',false).forEach((driver) => {
      out.push({label: driver.name, value: driver.name+'Config'});
    });

    return out;
  }.property('availableDrivers.@each.{hasUi,name}'),

  willSave() {
    // Null out all the drivers that aren't the active one, because the API only accepts one.
    let activeDriver = this.get('otherDriver');
    let host      = this.get('model');
    this.get('otherChoices').forEach((choice) => {
      let cur = choice.value;
      if ( choice.value !== activeDriver ) {
        host.set(cur, null);
      }
    });

    return this._super();
  },
});
