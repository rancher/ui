import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  driverName      : 'other',
  model           : null,
  driver          : null,
  availableDrivers: null,
  primaryResource : Ember.computed.alias('model.machine'),
  driverOpts      : null,

  bootstrap: function() {
    let store = this.get('store');

    this.set('model', {machine: store.createRecord({type : 'machine'})});

    store.findAll('schema').then((schemas) => {
      store.findAll('typedocumentation').then((typeDocs) => {
        this.set('model', Ember.Object.create({
          machine            : this.get('model.machine'),
          schemas            : schemas,
          typeDocumentations : typeDocs,
          otherChoices       : this.get('otherChoices')
        }));
        this.set('driver', this.get('otherChoices.firstObject.value'));
      });
    });
  },

  willDestroyElement() {
    this.setProperties({
      driver     : null,
      driverOpts : null,
    });
  },

  fieldNames: function() {
    let driver = this.get('driver');

    if ( driver ) {
      return Object.keys(this.get('store').getById('schema', driver.toLowerCase()).get('resourceFields'));
    }
  }.property('driver', 'model'),

  driverChanged: function() {
    let driver  = this.get('driver');
    let machine = this.get('model.machine');

    if ( driver && machine) {

      if ( !machine.get(driver) ) {
        machine.set(driver, this.get('store').createRecord({ type: driver }));
      }

      this.set('driverOpts', machine.get(driver));
    }
  }.observes('driver', 'model.machine'),

  otherChoices: function() {
    let out = [];
    this.get('availableDrivers').filterBy('hasUi',false).forEach((driver) => {
      out.push({label: driver.name, value: driver.name+'Config'});
    });

    return out;
  }.property('availableDrivers.@each.{hasUi,name}'),

  willSave() {
    // Null out all the drivers that aren't the active one, because the API only accepts one.
    let activeDriver = this.get('driver');
    let machine      = this.get('model.machine');
    this.get('model.otherChoices').forEach((choice) => {
      let cur = choice.value;
      if ( choice.value !== activeDriver ) {
        machine.set(cur, null);
      }
    });

    return this._super();
  },
});
