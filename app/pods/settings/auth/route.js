import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  model: function() {
    return this.get('store').find('githubconfig').then(function(collection) {
      return collection.get('firstObject');
    });
  },

  setupController: function(controller, model) {
    this._super(controller,model);
    controller.set('confirmDisable',false);
  }
});
