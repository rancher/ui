import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  language: Ember.inject.service('user-language'),

  beforeModel(transition) {
    this._super.apply(this,arguments);
    return this.get('language').initUnauthed().then(() => {
      if ( !this.get('access.enabled') && !transition.queryParams.shibbolethTest)
      {
        this.transitionTo('authenticated');
      }
    });
  },
});
