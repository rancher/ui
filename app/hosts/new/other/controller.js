import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

const exclude = ['amazonec2Config','digitaloceanConfig','exoscaleConfig','packetConfig','rackspaceConfig'];

export default Ember.Controller.extend(NewHost, {
  driver: null,
  primaryResource: Ember.computed.alias('model.machine'),
  driverOpts: null,

  driverChoices: function() {
    var schema = this.get('store').getById('schema','machine');
    var fields = schema.get('resourceFields');
    var keys = Object.keys(fields);
    var out = [];
    keys.forEach((key) => {
      var field = fields[key];
      var match;
      if ( exclude.indexOf(key) === -1 )
      {
        if ( match = field.type.match(/^(.*)Config$/) )
        {
          out.push({label: match[1], value: key});
        }
      }
    });

    return out;
  }.property(),

  fieldNames: function() {
    var driver = this.get('driver');
    if ( driver )
    {
      var schema = this.get('store').getById('schema', driver.toLowerCase());
      var fields = schema.get('resourceFields');
      var keys = Object.keys(fields);
      return keys;
    }
  }.property('driver'),

  driverChanged: function() {
    var driver = this.get('driver');
    if ( driver )
    {
      var machine = this.get('model.machine');
      if ( !machine.get(driver) )
      {
        machine.set(driver, this.get('store').createRecord({
          type: driver
        }));
      }

      this.set('driverOpts', machine.get(driver));
    }
  }.observes('driver').on('init'),

  willSave() {
    // Null out all the drivers that aren't the active one, because the API only accepts one.
    var activeDriver = this.get('driver');
    var machine = this.get('model.machine');
    this.get('driverChoices').forEach((choice) => {
      var cur = choice.value;
      if ( choice.value !== activeDriver )
      {
        machine.set(cur, null);
      }
    });

    return this._super();
  },

  doneSaving() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
