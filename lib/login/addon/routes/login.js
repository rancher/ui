import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  language: Ember.inject.service('user-language'),
  activate: function() {
    $('BODY').addClass('container-farm');
  },

  deactivate: function() {
    $('BODY').removeClass('container-farm');
  },
  beforeModel(/* transition */) {
    this._super.apply(this,arguments);
    return this.get('language').initUnauthed().then(() => {
      // if ( !this.get('access.enabled') && !transition.queryParams.shibbolethTest)
      // {
      //   this.transitionToExternal('authenticated');
      // }
    });
  },
  // model: function(params) {
  //   params;
  //   debugger;
  // },
});
