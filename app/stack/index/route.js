import Ember from 'ember';

export default Ember.Route.extend({
  parentRoute:  'stack',

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('showAddtlInfo', false);
    }
  },

  model(/* params, transition */) {
    let model = this.modelFor(this.get('parentRoute'));

    return this.get('store').findAll('volume').then((volumes) => {
      return this.get('store').findAll('volumetemplate').then((volumeTemplates) => {

        let volOut    = [];

        model.volumes = volOut.concat(volumes.filterBy('stackId', model.get('stack.id')), volumeTemplates.filterBy('stackId', model.get('stack.id')));

        return model;
      });
    });
  }
});
