import Ember from 'ember';
import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'other',

  newModel: function() {
    var store = this.get('store');
    return store.findAll('schema').then((schemas) => {
      return store.findAll('typedocumentation').then((typeDocs) => {
        return Ember.Object.create({
          machine: store.createRecord({type: 'machine'}),
          schemas: schemas,
          typeDocumentations: typeDocs,
        });
      });
    });
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
