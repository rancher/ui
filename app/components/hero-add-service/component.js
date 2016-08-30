import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  stackId: null,

  actions: {
    newService() {
      var stackId = this.get('stackId');

      if ( stackId )
      {
        this.get('router').transitionTo('service.new', {queryParams: {stackId: stackId}});
      }
      else
      {
        var stack = this.get('store').createRecord({
          type: 'stack',
          name: 'Default',
        });

        return stack.save().then(() => {
          this.get('router').transitionTo('service.new', {queryParams: {stackId: stack.get('id') }});
        });
      }
    },
  }
});
