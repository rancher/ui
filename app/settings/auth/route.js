import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  model: function() {

    var headers = {};
    headers[C.HEADER.PROJECT] = undefined;

    return this.get('store').find('githubconfig', null, {headers: headers, forceReload: true}).then(function(collection) {
      return collection.get('firstObject');
    });
  },

  setupController: function(controller, model) {
    controller.set('model', model.clone());
    controller.set('originalModel', model);
    controller.set('confirmDisable',false);
    controller.set('saving',false);
    controller.set('saved',true);
    controller.set('testing',false);
    controller.set('wasShowing',false);
    controller.set('organizations', this.get('session.orgs')||[]);
    controller.set('error',null);
  }
});
