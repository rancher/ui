import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  model: function() {
    return this.get('store').find('githubconfig', null, {forceReload: true}).then(function(collection) {
      return collection.get('firstObject');
    });
  },

  setupController: function(controller, model) {
    this._super(controller,model);
    controller.set('confirmDisable',false);
    controller.set('saving',false);
    controller.set('saved',true);
    controller.set('testing',false);
    controller.set('organizations', this.get('session.orgs')||[]);
    controller.set('error',null);
  }
});
