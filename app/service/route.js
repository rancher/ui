import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var service = this.get('store').getById('service', params.scaling_group_id);
    if ( service )
    {
      return Ember.Object.create({
        service: service,
        stack: service.get('stack'),
      });
    }
    else
    {
      return this.get('store').find('service', params.scaling_group_id).then((service) => {
        return Ember.Object.create({
          service: service,
          stack: service.get('stack'),
        });
      });
    }
  },
});
