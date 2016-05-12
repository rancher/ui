import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  environmentId: null,

  tagName: 'section',
  classNames: ['welcome'],

  actions: {
    newService() {
      var environmentId = this.get('environmentId');

      if ( environmentId )
      {
        this.get('router').transitionTo('service.new', {queryParams: {environmentId: environmentId}});
      }
      else
      {
        var env = this.get('store').createRecord({
          type: 'environment',
          name: 'Default',
        });

        return env.save().then(() => {
          this.get('router').transitionTo('service.new', {queryParams: {environmentId: env.get('id') }});
        });
      }
    },
  }
});
