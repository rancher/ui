import Ember from 'ember';
import DriverRoute from 'ui/hosts/new/driver-route';

const exclude = ['amazonec2Config','azureConfig', 'digitaloceanConfig','exoscaleConfig','packetConfig','rackspaceConfig','ubiquityConfig'];

export default DriverRoute.extend({
  driverName: 'other',

  otherChoices: function() {
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


  newModel: function() {
    var store = this.get('store');
    return store.findAll('schema').then((schemas) => {
      return store.findAll('typedocumentation').then((typeDocs) => {
        return Ember.Object.create({
          machine: store.createRecord({type: 'machine'}),
          schemas: schemas,
          typeDocumentations: typeDocs,
          otherChoices: this.get('otherChoices')
        });
      });
    });
  },

  setupController: function(controller/*, model*/) {
    this._super.apply(this,arguments);
    controller.set('driver', this.get('otherChoices.firstObject.value'));
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.setProperties({
        driver: null,
        driverOpts: null,
      });
    }
  }
});
